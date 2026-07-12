const prisma = require('../../config/database');
const ApiError = require('../../utils/ApiError');
const { calculateOperationalCost } = require('../../utils/helpers');

const getVehicles = async () => {
  return prisma.vehicle.findMany({
    orderBy: { name: 'asc' },
  });
};

const getOperationalCost = async (vehicleId) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
  });
  if (!vehicle) {
    throw new ApiError(404, `Vehicle #${vehicleId} not found`);
  }

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

  const totalOperationalCost = calculateOperationalCost(
    totalFuelCost,
    totalMaintenanceCost,
    totalOtherExpenses
  );

  return {
    vehicleId,
    registrationNumber: vehicle.registrationNumber,
    name: vehicle.name,
    totalFuelCost,
    totalMaintenanceCost,
    totalOtherExpenses,
    totalOperationalCost,
  };
};

module.exports = {
  getVehicles,
  getOperationalCost,
};
