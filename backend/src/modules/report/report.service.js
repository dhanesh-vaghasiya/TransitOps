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

  // Calculate Vehicle Type Distribution (for the pie chart)
  const vehiclesGroupedByType = await prisma.vehicle.groupBy({
    by: ['type'],
    _count: { id: true },
    where: vehicleWhere
  });
  
  const typeMap = {
    van: 'Van',
    truck: 'Truck',
    lorry: 'Lorry',
    bike: 'Bike',
    car: 'Car',
    bus: 'Bus'
  };

  let distributionData = vehiclesGroupedByType.map(v => ({
    name: typeMap[v.type] || v.type,
    value: v._count.id
  }));
  
  if (distributionData.length === 0) {
    distributionData = [{ name: 'No Vehicles', value: 1 }];
  }

  // Calculate Trip Volume Trend (for the bar chart)
  // Fetch trips for the last 24 hours
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  const recent24hTrips = await prisma.trip.findMany({
    where: {
      ...tripVehicleFilter,
      createdAt: { gte: yesterday }
    },
    select: { status: true, createdAt: true }
  });

  const tripVolumeMap = {
    '00:00 - 06:00': { active: 0, projected: 0 },
    '06:00 - 12:00': { active: 0, projected: 0 },
    '12:00 - 18:00': { active: 0, projected: 0 },
    '18:00 - 24:00': { active: 0, projected: 0 },
  };

  recent24hTrips.forEach(trip => {
    const hour = trip.createdAt.getHours();
    let bucket = '00:00 - 06:00';
    if (hour >= 6 && hour < 12) bucket = '06:00 - 12:00';
    else if (hour >= 12 && hour < 18) bucket = '12:00 - 18:00';
    else if (hour >= 18) bucket = '18:00 - 24:00';

    if (['dispatched', 'completed'].includes(trip.status)) {
      tripVolumeMap[bucket].active += 1;
    } else {
      // draft or cancelled
      tripVolumeMap[bucket].projected += 1;
    }
  });

  const tripVolumeData = Object.keys(tripVolumeMap).map(time => ({
    time,
    active: tripVolumeMap[time].active,
    projected: tripVolumeMap[time].projected,
  }));

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
    recentTrips,
    graphs: {
      distributionData,
      tripVolumeData
    }
  };
};

module.exports = {
  getDashboardKPIs
};
