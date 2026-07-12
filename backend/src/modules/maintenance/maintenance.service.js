const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllMaintenanceLogs = async () => {
  return await prisma.maintenanceLog.findMany({
    include: {
      vehicle: { select: { registrationNumber: true, name: true, status: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

const getMaintenanceById = async (id) => {
  return await prisma.maintenanceLog.findUnique({
    where: { id },
    include: {
      vehicle: { select: { id: true, registrationNumber: true, status: true } },
    }
  });
};

const createMaintenance = async (data) => {
  return await prisma.maintenanceLog.create({
    data: {
      ...data,
      startedAt: data.status === 'in_progress' ? new Date() : null,
    },
    include: {
      vehicle: true,
    }
  });
};

const updateMaintenance = async (id, data) => {
  return await prisma.maintenanceLog.update({
    where: { id },
    data: {
      ...data,
      completedAt: data.status === 'completed' ? new Date() : undefined,
      startedAt: data.status === 'in_progress' ? new Date() : undefined,
    },
    include: {
      vehicle: true,
    }
  });
};

const checkVehicleStatus = async (vehicleId) => {
  return await prisma.vehicle.findUnique({
    where: { id: vehicleId }
  });
};

module.exports = {
  getAllMaintenanceLogs,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  checkVehicleStatus
};
