const { PrismaClient } = require('@prisma/client');
const { calculateOperationalCost } = require('../../utils/helpers');
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

const getAnalyticsReport = async () => {
  const trips = await prisma.trip.findMany({
    where: { status: 'completed' },
    include: {
      fuelLogs: true,
      expenses: true,
      vehicle: true,
    }
  });

  const vehicles = await prisma.vehicle.findMany({
    include: {
      maintenanceLogs: true,
      expenses: true,
      fuelLogs: true,
    }
  });

  let totalDistance = 0;
  let totalFuel = 0;
  trips.forEach(t => {
    totalDistance += parseFloat(t.actualDistance || 0);
    totalFuel += parseFloat(t.fuelConsumed || 0);
  });
  const fuelEfficiency = totalFuel > 0 ? (totalDistance / totalFuel).toFixed(2) : '0.00';

  const activeVehicles = vehicles.filter(v => v.status === 'on_trip').length;
  const fleetUtilization = vehicles.length > 0 ? ((activeVehicles / vehicles.length) * 100).toFixed(2) : '0.00';

  let totalFuelCost = 0;
  let totalMaintenanceCost = 0;
  let totalOtherCost = 0;
  let totalRevenue = 0;

  vehicles.forEach(v => {
    v.fuelLogs.forEach(fl => totalFuelCost += parseFloat(fl.totalCost || 0));
    v.maintenanceLogs.forEach(ml => totalMaintenanceCost += parseFloat(ml.cost || 0));
    v.expenses.forEach(ex => totalOtherCost += parseFloat(ex.amount || 0));
  });

  trips.forEach(t => {
    const weight = parseFloat(t.cargoWeight || 0);
    const distance = parseFloat(t.actualDistance || 0);
    totalRevenue += (weight * distance * 0.05);
  });

  const operationalCost = calculateOperationalCost(totalFuelCost, totalMaintenanceCost, totalOtherCost);
  
  let totalAcquisitionCost = 0;
  vehicles.forEach(v => totalAcquisitionCost += parseFloat(v.acquisitionCost || 0));

  const maintAndFuel = totalMaintenanceCost + totalFuelCost;
  const roi = totalAcquisitionCost > 0 ? (((totalRevenue - maintAndFuel) / totalAcquisitionCost) * 100).toFixed(2) : '0.00';

  const vehicleCosts = vehicles.map(v => {
    let cost = 0;
    v.fuelLogs.forEach(fl => cost += parseFloat(fl.totalCost || 0));
    v.maintenanceLogs.forEach(ml => cost += parseFloat(ml.cost || 0));
    v.expenses.forEach(ex => cost += parseFloat(ex.amount || 0));
    return { name: v.registrationNumber, cost };
  });

  vehicleCosts.sort((a, b) => b.cost - a.cost);
  const costliestVehicles = vehicleCosts.slice(0, 5);

  const currentYear = new Date().getFullYear();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyData = months.map(m => ({ month: m, actual: 0, projected: 0 }));

  trips.forEach(t => {
    const tripDate = t.completedAt || t.startedAt || t.createdAt;
    if (tripDate && tripDate.getFullYear() === currentYear) {
      const monthIdx = tripDate.getMonth();
      const weight = parseFloat(t.cargoWeight || 0);
      const dist = parseFloat(t.actualDistance || 0);
      const plannedDist = parseFloat(t.plannedDistance || 0);
      
      const actualRev = weight * dist * 0.05;
      const projRev = weight * plannedDist * 0.05;
      
      monthlyData[monthIdx].actual += actualRev;
      monthlyData[monthIdx].projected += projRev;
    }
  });

  return {
    kpis: {
      fuelEfficiency: `${fuelEfficiency} km/l`,
      fleetUtilization: `${fleetUtilization}%`,
      operationalCost: `₹${operationalCost.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
      roi: `${roi >= 0 ? '+' : ''}${roi}%`
    },
    charts: {
      monthlyRevenue: monthlyData,
      costliestVehicles
    },
    raw: {
      totalDistance,
      totalFuel,
      activeVehicles,
      totalVehicles: vehicles.length,
      totalRevenue,
      maintAndFuel,
      totalAcquisitionCost,
      operationalCost,
    }
  };
};

module.exports = {
  getDashboardKPIs,
  getAnalyticsReport
};
