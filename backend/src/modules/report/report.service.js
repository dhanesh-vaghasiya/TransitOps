const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getDashboardKPIs = async (filters = {}) => {
  const { type, status, search } = filters;
  
  const vehicleWhere = {};
  if (type) vehicleWhere.type = type;
  if (status) vehicleWhere.status = status;
  if (search) {
    vehicleWhere.OR = [
      { registrationNumber: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
    ];
  }

  // For trips, we might filter by vehicle type/status indirectly
  const tripVehicleFilter = Object.keys(vehicleWhere).length > 0 ? { vehicle: vehicleWhere } : {};

  const [
    totalVehicles,
    availableVehicles,
    activeVehicles,
    maintenanceVehicles,
    totalDrivers,
    driversOnDuty,
    activeTrips,
    pendingTrips,
    completedTripsToday,
    recentTrips
  ] = await Promise.all([
    prisma.vehicle.count({ where: vehicleWhere }),
    prisma.vehicle.count({ where: { ...vehicleWhere, status: 'available' } }),
    prisma.vehicle.count({ where: { ...vehicleWhere, status: 'on_trip' } }),
    prisma.vehicle.count({ where: { ...vehicleWhere, status: 'in_shop' } }),
    prisma.driver.count(),
    prisma.driver.count({ where: { status: 'on_trip' } }),
    prisma.trip.count({ where: { status: 'dispatched', ...tripVehicleFilter } }),
    prisma.trip.count({ where: { status: 'draft', ...tripVehicleFilter } }),
    prisma.trip.count({
      where: {
        status: 'completed',
        completedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        ...tripVehicleFilter
      }
    }),
    prisma.trip.findMany({
      where: tripVehicleFilter,
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        vehicle: true,
        driver: true
      }
    })
  ]);

  const utilization = totalVehicles > 0
    ? ((activeVehicles / totalVehicles) * 100).toFixed(2)
    : 0;

  return {
    kpis: {
      totalVehicles,
      availableVehicles,
      activeVehicles,
      maintenanceVehicles,
      totalDrivers,
      driversOnDuty,
      activeTrips,
      pendingTrips,
      completedTripsToday,
      fleetUtilization: `${utilization}%`
    },
    recentTrips
  };
};

module.exports = {
  getDashboardKPIs
};
