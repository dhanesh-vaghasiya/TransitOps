const prisma = require('../../config/database');
const ApiError = require('../../utils/ApiError');

const getAllFuelLogs = async ({ page = 1, limit = 50 } = {}) => {
  const skip = (page - 1) * limit;

  const [fuelLogs, total] = await Promise.all([
    prisma.fuelLog.findMany({
      skip,
      take: limit,
      orderBy: { loggedAt: 'desc' },
      include: {
        vehicle: {
          select: {
            id: true,
            name: true,
            registrationNumber: true,
            type: true,
            odometer: true,
          },
        },
        trip: {
          select: {
            id: true,
            tripNumber: true,
            source: true,
            destination: true,
          },
        },
      },
    }),
    prisma.fuelLog.count(),
  ]);

  return { fuelLogs, total, page, limit };
};

const createFuelLog = async (data) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: data.vehicleId },
  });
  if (!vehicle) {
    throw new ApiError(404, `Vehicle #${data.vehicleId} not found`);
  }

  if (data.tripId) {
    const trip = await prisma.trip.findUnique({
      where: { id: data.tripId },
    });
    if (!trip) {
      throw new ApiError(404, `Trip #${data.tripId} not found`);
    }
  }

  // Calculate totalCost if not provided
  const liters = Number(data.liters);
  const costPerLiter = Number(data.costPerLiter);
  const totalCost = data.totalCost ? Number(data.totalCost) : liters * costPerLiter;

  // Generate unique receipt number if not provided
  let receiptNumber = data.receiptNumber;
  if (!receiptNumber) {
    receiptNumber = `FUEL-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  } else {
    // Check uniqueness
    const existing = await prisma.fuelLog.findUnique({
      where: { receiptNumber },
    });
    if (existing) {
      throw new ApiError(409, `Receipt number "${receiptNumber}" already exists`);
    }
  }

  const result = await prisma.$transaction(async (tx) => {
    // Create the fuel log
    const fuelLog = await tx.fuelLog.create({
      data: {
        receiptNumber,
        tripId: data.tripId || null,
        vehicleId: data.vehicleId,
        liters,
        costPerLiter,
        totalCost,
        odometerReading: Number(data.odometerReading),
        loggedAt: new Date(),
      },
      include: {
        vehicle: true,
        trip: true,
      },
    });

    // Update vehicle odometer if new reading is greater
    if (Number(data.odometerReading) > Number(vehicle.odometer)) {
      await tx.vehicle.update({
        where: { id: data.vehicleId },
        data: { odometer: Number(data.odometerReading) },
      });
    }

    return fuelLog;
  });

  return result;
};

module.exports = {
  getAllFuelLogs,
  createFuelLog,
};
