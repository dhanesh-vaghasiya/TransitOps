const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const SAMPLE_PASSWORD_HASH =
  '$2b$10$TransitOpsSeedPasswordHashForLocalDevelopmentOnly';

async function seedRoles() {
  const roles = [
    ['fleet_manager', 'Oversees fleet assets, maintenance, and vehicle lifecycle'],
    ['driver', 'Creates and executes trips with assigned vehicles'],
    ['safety_officer', 'Tracks driver compliance and license validity'],
    ['financial_analyst', 'Reviews operational expenses and fleet costs'],
  ];

  return Promise.all(
    roles.map(([name, description]) =>
      prisma.role.upsert({
        where: { name },
        update: { description },
        create: { name, description },
      })
    )
  );
}

async function seedUsers(roles) {
  const roleByName = Object.fromEntries(roles.map((role) => [role.name, role]));
  const users = [
    {
      email: 'manager@transitops.local',
      fullName: 'Fleet Manager',
      roles: ['fleet_manager', 'financial_analyst'],
    },
    {
      email: 'safety@transitops.local',
      fullName: 'Safety Officer',
      roles: ['safety_officer'],
    },
    {
      email: 'driver@transitops.local',
      fullName: 'Demo Driver',
      roles: ['driver'],
    },
  ];

  for (const user of users) {
    const savedUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        fullName: user.fullName,
        status: 'active',
      },
      create: {
        email: user.email,
        passwordHash: SAMPLE_PASSWORD_HASH,
        fullName: user.fullName,
        status: 'active',
      },
    });

    for (const roleName of user.roles) {
      await prisma.userRole.upsert({
        where: {
          userId_roleId: {
            userId: savedUser.id,
            roleId: roleByName[roleName].id,
          },
        },
        update: {},
        create: {
          userId: savedUser.id,
          roleId: roleByName[roleName].id,
        },
      });
    }
  }
}

async function seedVehicles() {
  const vehicles = [
    {
      registrationNumber: 'GJ01TX1001',
      name: 'Ahmedabad Cargo Van',
      model: 'Tata Winger',
      type: 'van',
      maxLoadCapacity: '1200.00',
      odometer: '18450.00',
      acquisitionCost: '1450000.00',
      status: 'available',
    },
    {
      registrationNumber: 'GJ01TX2030',
      name: 'Intercity Freight Truck',
      model: 'Ashok Leyland Ecomet',
      type: 'truck',
      maxLoadCapacity: '7500.00',
      odometer: '46200.00',
      acquisitionCost: '2850000.00',
      status: 'available',
    },
    {
      registrationNumber: 'GJ18TX7788',
      name: 'Express Delivery Bike',
      model: 'TVS Raider',
      type: 'bike',
      maxLoadCapacity: '120.00',
      odometer: '8200.00',
      acquisitionCost: '112000.00',
      status: 'available',
    },
  ];

  const saved = [];
  for (const vehicle of vehicles) {
    saved.push(
      await prisma.vehicle.upsert({
        where: { registrationNumber: vehicle.registrationNumber },
        update: vehicle,
        create: vehicle,
      })
    );
  }
  return saved;
}

async function seedDrivers() {
  const drivers = [
    {
      name: 'Arjun Patel',
      licenseNumber: 'GJ-DRV-10001',
      licenseCategory: 'D',
      licenseExpiry: new Date('2028-04-30'),
      contactNumber: '+919876543210',
      safetyScore: '96.50',
      status: 'available',
    },
    {
      name: 'Meera Shah',
      licenseNumber: 'GJ-DRV-10002',
      licenseCategory: 'C',
      licenseExpiry: new Date('2027-11-15'),
      contactNumber: '+919812345678',
      safetyScore: '98.00',
      status: 'available',
    },
    {
      name: 'Ravi Solanki',
      licenseNumber: 'GJ-DRV-10003',
      licenseCategory: 'A',
      licenseExpiry: new Date('2029-02-10'),
      contactNumber: '+919899001122',
      safetyScore: '93.25',
      status: 'available',
    },
  ];

  const saved = [];
  for (const driver of drivers) {
    saved.push(
      await prisma.driver.upsert({
        where: { licenseNumber: driver.licenseNumber },
        update: driver,
        create: driver,
      })
    );
  }
  return saved;
}

async function seedOperations(vehicles, drivers) {
  const van = vehicles.find((vehicle) => vehicle.registrationNumber === 'GJ01TX1001');
  const truck = vehicles.find((vehicle) => vehicle.registrationNumber === 'GJ01TX2030');
  const bike = vehicles.find((vehicle) => vehicle.registrationNumber === 'GJ18TX7788');
  const arjun = drivers.find((driver) => driver.licenseNumber === 'GJ-DRV-10001');
  const meera = drivers.find((driver) => driver.licenseNumber === 'GJ-DRV-10002');

  const completedTrip = await prisma.trip.upsert({
    where: { tripNumber: 'TRIP-2026-0001' },
    update: {
      vehicleId: van.id,
      driverId: arjun.id,
      source: 'Ahmedabad Warehouse',
      destination: 'Vadodara Distribution Hub',
      cargoWeight: '760.00',
      plannedDistance: '112.00',
      actualDistance: '118.40',
      fuelConsumed: '15.80',
      status: 'completed',
      startedAt: new Date('2026-07-02T04:30:00.000Z'),
      completedAt: new Date('2026-07-02T08:45:00.000Z'),
    },
    create: {
      tripNumber: 'TRIP-2026-0001',
      vehicleId: van.id,
      driverId: arjun.id,
      source: 'Ahmedabad Warehouse',
      destination: 'Vadodara Distribution Hub',
      cargoWeight: '760.00',
      plannedDistance: '112.00',
      actualDistance: '118.40',
      fuelConsumed: '15.80',
      status: 'completed',
      startedAt: new Date('2026-07-02T04:30:00.000Z'),
      completedAt: new Date('2026-07-02T08:45:00.000Z'),
    },
  });

  await prisma.trip.upsert({
    where: { tripNumber: 'TRIP-2026-0002' },
    update: {
      vehicleId: truck.id,
      driverId: meera.id,
      source: 'Ahmedabad Yard',
      destination: 'Surat Port',
      cargoWeight: '5200.00',
      plannedDistance: '265.00',
      status: 'draft',
    },
    create: {
      tripNumber: 'TRIP-2026-0002',
      vehicleId: truck.id,
      driverId: meera.id,
      source: 'Ahmedabad Yard',
      destination: 'Surat Port',
      cargoWeight: '5200.00',
      plannedDistance: '265.00',
      status: 'draft',
    },
  });

  await prisma.fuelLog.upsert({
    where: { receiptNumber: 'FUEL-2026-0001' },
    update: {
      tripId: completedTrip.id,
      vehicleId: van.id,
      liters: '15.80',
      costPerLiter: '96.25',
      totalCost: '1520.75',
      odometerReading: '18568.40',
      loggedAt: new Date('2026-07-02T08:50:00.000Z'),
    },
    create: {
      receiptNumber: 'FUEL-2026-0001',
      tripId: completedTrip.id,
      vehicleId: van.id,
      liters: '15.80',
      costPerLiter: '96.25',
      totalCost: '1520.75',
      odometerReading: '18568.40',
      loggedAt: new Date('2026-07-02T08:50:00.000Z'),
    },
  });

  await prisma.maintenanceLog.upsert({
    where: { workOrderNumber: 'WO-2026-0001' },
    update: {
      vehicleId: truck.id,
      maintenanceType: 'general_inspection',
      description: 'Quarterly inspection before long-haul dispatch.',
      cost: '3500.00',
      status: 'scheduled',
    },
    create: {
      workOrderNumber: 'WO-2026-0001',
      vehicleId: truck.id,
      maintenanceType: 'general_inspection',
      description: 'Quarterly inspection before long-haul dispatch.',
      cost: '3500.00',
      status: 'scheduled',
    },
  });

  await prisma.expense.upsert({
    where: { expenseNumber: 'EXP-2026-0001' },
    update: {
      tripId: completedTrip.id,
      vehicleId: van.id,
      category: 'toll',
      amount: '240.00',
      description: 'Expressway toll for Ahmedabad to Vadodara trip.',
      incurredAt: new Date('2026-07-02T06:10:00.000Z'),
    },
    create: {
      expenseNumber: 'EXP-2026-0001',
      tripId: completedTrip.id,
      vehicleId: van.id,
      category: 'toll',
      amount: '240.00',
      description: 'Expressway toll for Ahmedabad to Vadodara trip.',
      incurredAt: new Date('2026-07-02T06:10:00.000Z'),
    },
  });

  await prisma.expense.upsert({
    where: { expenseNumber: 'EXP-2026-0002' },
    update: {
      vehicleId: bike.id,
      category: 'insurance',
      amount: '4100.00',
      description: 'Annual insurance renewal.',
      incurredAt: new Date('2026-07-01T10:00:00.000Z'),
    },
    create: {
      expenseNumber: 'EXP-2026-0002',
      vehicleId: bike.id,
      category: 'insurance',
      amount: '4100.00',
      description: 'Annual insurance renewal.',
      incurredAt: new Date('2026-07-01T10:00:00.000Z'),
    },
  });
}

async function main() {
  const roles = await seedRoles();
  await seedUsers(roles);
  const vehicles = await seedVehicles();
  const drivers = await seedDrivers();
  await seedOperations(vehicles, drivers);
}

main()
  .then(async () => {
    console.log('TransitOps seed data loaded successfully.');
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
