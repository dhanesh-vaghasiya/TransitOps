const prisma = require('../../db');
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
    orderBy: { createdAt: 'desc' }
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
    orderBy: { createdAt: 'desc' }
  });
};

const getOperationalCost = async (id) => {
  const vehicleId = parseInt(id, 10);
  
  // Verify vehicle exists
  await getVehicleById(vehicleId);

  const expenses = await prisma.expense.aggregate({
    where: { vehicleId },
    _sum: { amount: true }
  });

  const maintenance = await prisma.maintenanceLog.aggregate({
    where: { vehicleId },
    _sum: { cost: true }
  });

  const fuel = await prisma.fuelLog.aggregate({
    where: { vehicleId },
    _sum: { totalCost: true }
  });

  const expenseTotal = Number(expenses._sum.amount || 0);
  const maintenanceTotal = Number(maintenance._sum.cost || 0);
  const fuelTotal = Number(fuel._sum.totalCost || 0);

  return {
    vehicleId,
    breakdown: {
      expenses: expenseTotal,
      maintenance: maintenanceTotal,
      fuel: fuelTotal
    },
    totalOperationalCost: expenseTotal + maintenanceTotal + fuelTotal
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
