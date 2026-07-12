const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllDrivers = async () => {
  return await prisma.driver.findMany({
    orderBy: { createdAt: 'desc' },
  });
};

const getDriverById = async (id) => {
  return await prisma.driver.findUnique({
    where: { id },
  });
};

const createDriver = async (data) => {
  return await prisma.driver.create({
    data,
  });
};

const updateDriver = async (id, data) => {
  return await prisma.driver.update({
    where: { id },
    data,
  });
};

const deleteDriver = async (id) => {
  return await prisma.driver.delete({
    where: { id },
  });
};

const getDispatchPool = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // start of day for comparison if needed
  return await prisma.driver.findMany({
    where: {
      status: {
        not: 'suspended',
      },
      licenseExpiry: {
        gte: today,
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

module.exports = {
  getAllDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
  getDispatchPool,
};
