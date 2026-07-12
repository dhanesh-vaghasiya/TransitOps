const prisma = require('../../config/database');
const ApiError = require('../../utils/ApiError');

const createVehicle = async (data) => {
  try {
    const vehicle = await prisma.vehicle.create({
      data,
    });
    return vehicle;
  } catch (error) {
    if (error.code === 'P2002') {
      throw new ApiError(409, 'Registration number must be unique.');
    }
    throw error;
  }
};

const getVehicles = async (filters = {}) => {
  const where = {};
  
  if (filters.type) {
    where.type = filters.type;
  }
  
  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.search) {
    where.OR = [
      { registrationNumber: { contains: filters.search, mode: 'insensitive' } },
      { name: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return await prisma.vehicle.findMany({
    where,
    orderBy: { name: 'asc' }
  });
};

const getVehicleById = async (id) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: parseInt(id, 10) }
  });
  
  if (!vehicle) {
    throw new ApiError(404, 'Vehicle not found');
  }
  
  return vehicle;
};

const updateVehicle = async (id, data) => {
  try {
    const vehicle = await prisma.vehicle.update({
      where: { id: parseInt(id, 10) },
      data
    });
    return vehicle;
  } catch (error) {
    if (error.code === 'P2002') {
      throw new ApiError(409, 'Registration number must be unique.');
    }
    if (error.code === 'P2025') {
      throw new ApiError(404, 'Vehicle not found');
    }
    throw error;
  }
};

const deleteVehicle = async (id) => {
  try {
    await prisma.vehicle.delete({
      where: { id: parseInt(id, 10) }
    });
  } catch (error) {
    if (error.code === 'P2025') {
      throw new ApiError(404, 'Vehicle not found');
    }
    throw error;
  }
};

const getDispatchPool = async () => {
  return await prisma.vehicle.findMany({
    where: {
      status: {
        notIn: ['retired', 'in_shop']
      }
    },
    orderBy: { name: 'asc' }
  });
};

const getOperationalCost = async (id) => {
  const vehicleId = parseInt(id, 10);
  const vehicle = await getVehicleById(vehicleId);

  const fuelAgg = await prisma.fuelLog.aggregate({
    _sum: { totalCost: true },
    where: { vehicleId },
  });

  const maintenanceAgg = await prisma.maintenanceLog.aggregate({
    _sum: { cost: true },
    where: { vehicleId, status: 'completed' },
  });

  const expenseAgg = await prisma.expense.aggregate({
    _sum: { amount: true },
    where: { vehicleId },
  });

  const totalFuelCost = parseFloat(fuelAgg._sum.totalCost) || 0;
  const totalMaintenanceCost = parseFloat(maintenanceAgg._sum.cost) || 0;
  const totalOtherExpenses = parseFloat(expenseAgg._sum.amount) || 0;

  const totalOperationalCost = totalFuelCost + totalMaintenanceCost + totalOtherExpenses;

  return {
    vehicleId,
    registrationNumber: vehicle.registrationNumber,
    name: vehicle.name,
    totalFuelCost,
    totalMaintenanceCost,
    totalOtherExpenses,
    totalOperationalCost,
    breakdown: {
      expenses: totalOtherExpenses,
      maintenance: totalMaintenanceCost,
      fuel: totalFuelCost
    }
  };
};

module.exports = {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  getDispatchPool,
  getOperationalCost
};
