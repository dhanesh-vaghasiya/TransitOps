const prisma = require('../../config/database');
const ApiError = require('../../utils/ApiError');
const { emit } = require('../../config/socket');

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Generate a human-readable trip number: TRP-YYYYMMDD-XXXX
 */
const generateTripNumber = () => {
  const today = new Date();
  const datePart = today.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `TRP-${datePart}-${rand}`;
};

// ─── Read Queries ────────────────────────────────────────────────────────────

/**
 * Return all trips with vehicle + driver info, optionally filtered by status.
 */
const getAllTrips = async ({ status, page = 1, limit = 50 } = {}) => {
  const where = status ? { status } : {};
  const skip = (page - 1) * limit;

  const [trips, total] = await Promise.all([
    prisma.trip.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        vehicle: {
          select: {
            id: true,
            name: true,
            registrationNumber: true,
            type: true,
            maxLoadCapacity: true,
            status: true,
          },
        },
        driver: {
          select: {
            id: true,
            name: true,
            licenseNumber: true,
            licenseCategory: true,
            licenseExpiry: true,
            status: true,
          },
        },
      },
    }),
    prisma.trip.count({ where }),
  ]);

  return { trips, total, page, limit };
};

const getTripById = async (id) => {
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      vehicle: true,
      driver: true,
      fuelLogs: true,
      expenses: true,
    },
  });
  if (!trip) throw new ApiError(404, `Trip #${id} not found`);
  return trip;
};

/**
 * Return vehicles eligible for dispatch (available, not retired, not in_shop).
 */
const getDispatchPoolVehicles = async () => {
  return prisma.vehicle.findMany({
    where: { status: 'available' },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      registrationNumber: true,
      type: true,
      maxLoadCapacity: true,
      status: true,
    },
  });
};

/**
 * Return drivers eligible for dispatch (available, license not expired, not suspended).
 */
const getDispatchPoolDrivers = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return prisma.driver.findMany({
    where: {
      status: 'available',
      licenseExpiry: { gte: today },
    },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      licenseNumber: true,
      licenseCategory: true,
      licenseExpiry: true,
      status: true,
      safetyScore: true,
    },
  });
};

// ─── Mutations ───────────────────────────────────────────────────────────────

/**
 * Create a new trip in Draft status.
 */
const createTrip = async ({ vehicleId, driverId, source, destination, cargoWeight, plannedDistance }) => {
  // Ensure vehicle exists and is available
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) throw new ApiError(404, 'Vehicle not found');
  if (vehicle.status !== 'available') {
    throw new ApiError(409, `Vehicle is currently "${vehicle.status}" and cannot be assigned to a new trip`);
  }

  // Ensure driver exists and is available
  const driver = await prisma.driver.findUnique({ where: { id: driverId } });
  if (!driver) throw new ApiError(404, 'Driver not found');
  if (driver.status === 'suspended') {
    throw new ApiError(409, 'Driver is suspended and cannot be assigned to a trip');
  }
  if (driver.status !== 'available') {
    throw new ApiError(409, `Driver is currently "${driver.status}" and cannot be assigned to a new trip`);
  }

  // License expiry check
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (new Date(driver.licenseExpiry) < today) {
    throw new ApiError(409, "Driver's license has expired and cannot be assigned to a trip");
  }

  let tripNumber;
  let attempts = 0;
  do {
    tripNumber = generateTripNumber();
    attempts++;
    if (attempts > 10) throw new ApiError(500, 'Could not generate unique trip number');
  } while (await prisma.trip.findUnique({ where: { tripNumber } }));

  const trip = await prisma.trip.create({
    data: {
      tripNumber,
      vehicleId,
      driverId,
      source,
      destination,
      cargoWeight,
      plannedDistance,
      status: 'draft',
    },
    include: {
      vehicle: { select: { id: true, name: true, registrationNumber: true, maxLoadCapacity: true } },
      driver: { select: { id: true, name: true, licenseNumber: true } },
    },
  });

  emit('trip:updated', { action: 'created', trip });
  return trip;
};

/**
 * Dispatch a Draft trip → sets status to "dispatched".
 * Pre-conditions checked here; vehicle/driver status flips are handled by DB triggers.
 */
const dispatchTrip = async (id) => {
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      vehicle: true,
      driver: true,
    },
  });
  if (!trip) throw new ApiError(404, `Trip #${id} not found`);
  if (trip.status !== 'draft') {
    throw new ApiError(409, `Trip cannot be dispatched from "${trip.status}" status`);
  }

  // Re-validate vehicle availability at dispatch time
  if (trip.vehicle.status !== 'available') {
    throw new ApiError(409, `Vehicle is currently "${trip.vehicle.status}" — cannot dispatch`);
  }

  // Re-validate driver availability at dispatch time
  if (trip.driver.status !== 'available') {
    throw new ApiError(409, `Driver is currently "${trip.driver.status}" — cannot dispatch`);
  }

  // License expiry check
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (new Date(trip.driver.licenseExpiry) < today) {
    throw new ApiError(409, "Driver's license has expired — cannot dispatch");
  }

  // Capacity check: cargo_weight <= vehicle.max_load_capacity
  const cargoWeight = Number(trip.cargoWeight);
  const maxCapacity = Number(trip.vehicle.maxLoadCapacity);
  if (cargoWeight > maxCapacity) {
    const excess = (cargoWeight - maxCapacity).toFixed(0);
    throw new ApiError(422, `Capacity exceeded by ${excess} kg — dispatch blocked`);
  }

  // Update trip status; DB triggers handle vehicle/driver status
  const updated = await prisma.$transaction(async (tx) => {
    return tx.trip.update({
      where: { id },
      data: {
        status: 'dispatched',
        startedAt: new Date(),
      },
      include: {
        vehicle: { select: { id: true, name: true, registrationNumber: true, status: true } },
        driver: { select: { id: true, name: true, status: true } },
      },
    });
  });

  emit('trip:updated', { action: 'dispatched', trip: updated });
  emit('vehicle:status-changed', { vehicleId: updated.vehicleId, status: 'on_trip' });
  emit('driver:status-changed', { driverId: updated.driverId, status: 'on_trip' });

  return updated;
};

/**
 * Complete a Dispatched trip — requires odometer + fuel input.
 * Creates a linked FuelLog and updates vehicle odometer atomically.
 */
const completeTrip = async (id, { finalOdometer, fuelConsumed, fuelCostPerLiter }) => {
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: { vehicle: true },
  });
  if (!trip) throw new ApiError(404, `Trip #${id} not found`);
  if (trip.status !== 'dispatched') {
    throw new ApiError(409, `Trip cannot be completed from "${trip.status}" status`);
  }

  const currentOdometer = Number(trip.vehicle.odometer);
  if (finalOdometer <= currentOdometer) {
    throw new ApiError(422, `Final odometer (${finalOdometer}) must be greater than current odometer (${currentOdometer})`);
  }

  const actualDistance = finalOdometer - currentOdometer;
  const totalFuelCost = fuelConsumed * fuelCostPerLiter;

  const receiptNumber = `FUEL-${trip.tripNumber}`;

  const updated = await prisma.$transaction(async (tx) => {
    // Update trip
    const completedTrip = await tx.trip.update({
      where: { id },
      data: {
        status: 'completed',
        completedAt: new Date(),
        actualDistance,
        fuelConsumed,
      },
      include: {
        vehicle: { select: { id: true, name: true, registrationNumber: true, status: true } },
        driver: { select: { id: true, name: true, status: true } },
      },
    });

    // Create fuel log
    await tx.fuelLog.create({
      data: {
        receiptNumber,
        tripId: id,
        vehicleId: trip.vehicleId,
        liters: fuelConsumed,
        costPerLiter: fuelCostPerLiter,
        totalCost: totalFuelCost,
        odometerReading: finalOdometer,
      },
    });

    // Update vehicle odometer
    await tx.vehicle.update({
      where: { id: trip.vehicleId },
      data: { odometer: finalOdometer },
    });

    return completedTrip;
  });

  emit('trip:updated', { action: 'completed', trip: updated });
  emit('vehicle:status-changed', { vehicleId: updated.vehicleId, status: 'available' });
  emit('driver:status-changed', { driverId: updated.driverId, status: 'available' });

  return updated;
};

/**
 * Cancel a Draft or Dispatched trip.
 * If trip was Dispatched, vehicle/driver revert to Available (via DB triggers on status change).
 */
const cancelTrip = async (id) => {
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      vehicle: { select: { id: true, status: true } },
      driver: { select: { id: true, status: true } },
    },
  });
  if (!trip) throw new ApiError(404, `Trip #${id} not found`);
  if (!['draft', 'dispatched'].includes(trip.status)) {
    throw new ApiError(409, `Trip cannot be cancelled from "${trip.status}" status`);
  }

  const wasDispatched = trip.status === 'dispatched';

  const updated = await prisma.$transaction(async (tx) => {
    return tx.trip.update({
      where: { id },
      data: { status: 'cancelled' },
      include: {
        vehicle: { select: { id: true, name: true, registrationNumber: true, status: true } },
        driver: { select: { id: true, name: true, status: true } },
      },
    });
  });

  emit('trip:updated', { action: 'cancelled', trip: updated });

  if (wasDispatched) {
    emit('vehicle:status-changed', { vehicleId: updated.vehicleId, status: 'available' });
    emit('driver:status-changed', { driverId: updated.driverId, status: 'available' });
  }

  return updated;
};

module.exports = {
  getAllTrips,
  getTripById,
  createTrip,
  dispatchTrip,
  completeTrip,
  cancelTrip,
  getDispatchPoolVehicles,
  getDispatchPoolDrivers,
};
