const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();



async function seedRoles() {
  const roles = [
    ['fleet_manager', 'Oversees fleet assets, maintenance, and vehicle lifecycle'],
    ['dispatcher', 'Creates and dispatches trips and manages active operations'],
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
      email: 'manager@gmail.com',
      passwordHash: '$2b$10$1btSK8T2pB5AEKO3mFkEQ.1ik/Ayai0jkBxYJs5JQz/fLCAvz8lrO', // manager123
      fullName: 'Fleet Manager',
      roles: ['fleet_manager'],
    },
    {
      email: 'dispatcher@gmail.com',
      passwordHash: '$2b$10$KKZxDYF8k7nGveKwpKBQluEX6sigmjqN0RIH3xM04EL5DClRdqCHq', // dispatcher123
      fullName: 'Dispatcher User',
      roles: ['dispatcher'],
    },
    {
      email: 'safety@gmail.com',
      passwordHash: '$2b$10$EVpnnDWHDpw6A7hXhxH0Leqc5kaAkR2LUFYO1qsG5QHrtGuGwxWOG', // safety123
      fullName: 'Safety Officer',
      roles: ['safety_officer'],
    },
    {
      email: 'analyst@gmail.com',
      passwordHash: '$2b$10$aTREiNskh6webdUS7HplPOpae1a0FtdQIf55xa5Daw5t73x8AS592', // analyst123
      fullName: 'Financial Analyst',
      roles: ['financial_analyst'],
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
        passwordHash: user.passwordHash,
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

const defaultRbacMatrix = {
  fleet_manager: {
    dashboard: 'full',
    fleet: 'full',
    drivers: 'full',
    trips: 'none',
    maintenance: 'full',
    fuel: 'none',
    analytics: 'full',
    settings: 'full'
  },
  dispatcher: {
    dashboard: 'full',
    fleet: 'view',
    drivers: 'none',
    trips: 'full',
    maintenance: 'none',
    fuel: 'none',
    analytics: 'none',
    settings: 'none'
  },
  safety_officer: {
    dashboard: 'full',
    fleet: 'none',
    drivers: 'full',
    trips: 'view',
    maintenance: 'none',
    fuel: 'none',
    analytics: 'none',
    settings: 'none'
  },
  financial_analyst: {
    dashboard: 'full',
    fleet: 'view',
    drivers: 'none',
    trips: 'none',
    maintenance: 'none',
    fuel: 'full',
    analytics: 'full',
    settings: 'none'
  }
};

async function seedSettings() {
  await prisma.settings.create({
    data: {
      depotName: 'Central Transit Depot',
      currency: 'USD',
      distanceUnit: 'km',
      rbacMatrix: defaultRbacMatrix,
    },
  });
}

async function seedSecurityLogs() {
  await prisma.securityLog.createMany({
    data: [
      { action: 'ROLE_MODIFIED', details: 'Dispatcher RK modified "Dispatcher" role permissions' },
      { action: 'SESSION_EXPIRED', details: 'System Auto-Lock triggered session expiry for Manager_Alex' },
    ]
  });
}


async function seedVehicles() {
  const vehicles = [
    {
      registrationNumber: 'VAN-05',
      name: 'City Delivery Van',
      model: 'Ford Transit',
      type: 'van',
      maxLoadCapacity: '1500.00',
      odometer: '45000.00',
      acquisitionCost: '35000.00',
      status: 'available',
    },
    {
      registrationNumber: 'TRUCK-11',
      name: 'Heavy Freight Truck',
      model: 'Volvo FH16',
      type: 'truck',
      maxLoadCapacity: '18000.00',
      odometer: '120500.00',
      acquisitionCost: '120000.00',
      status: 'available',
    },
    {
      registrationNumber: 'MINI-03',
      name: 'Express Mini Truck',
      model: 'Tata Ace',
      type: 'lorry',
      maxLoadCapacity: '800.00',
      odometer: '15000.00',
      acquisitionCost: '15000.00',
      status: 'available',
    },
    {
      registrationNumber: 'VAN-09',
      name: 'Suburban Delivery Van',
      model: 'Mercedes Sprinter',
      type: 'van',
      maxLoadCapacity: '1600.00',
      odometer: '32000.00',
      acquisitionCost: '42000.00',
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
      name: 'Alex',
      licenseNumber: 'LIC-ALEX-001',
      licenseCategory: 'van',
      licenseExpiry: new Date('2028-05-20'),
      contactNumber: '555-0101',
      safetyScore: '98.50',
      status: 'available',
    },
    {
      name: 'John',
      licenseNumber: 'LIC-JOHN-002',
      licenseCategory: 'truck',
      licenseExpiry: new Date('2027-11-15'),
      contactNumber: '555-0102',
      safetyScore: '95.00',
      status: 'available',
    },
    {
      name: 'Priya',
      licenseNumber: 'LIC-PRIYA-003',
      licenseCategory: 'lorry',
      licenseExpiry: new Date('2029-02-10'),
      contactNumber: '555-0103',
      safetyScore: '99.00',
      status: 'available',
    },
    {
      name: 'Suresh',
      licenseNumber: 'LIC-SURESH-004',
      licenseCategory: 'van',
      licenseExpiry: new Date('2026-12-31'),
      contactNumber: '555-0104',
      safetyScore: '92.50',
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
  const van05 = vehicles.find(v => v.registrationNumber === 'VAN-05');
  const truck11 = vehicles.find(v => v.registrationNumber === 'TRUCK-11');
  const mini03 = vehicles.find(v => v.registrationNumber === 'MINI-03');
  const van09 = vehicles.find(v => v.registrationNumber === 'VAN-09');

  const alex = drivers.find(d => d.name === 'Alex');
  const john = drivers.find(d => d.name === 'John');
  const priya = drivers.find(d => d.name === 'Priya');
  const suresh = drivers.find(d => d.name === 'Suresh');

  const tripsData = [
    {
      tripNumber: 'TR001',
      vehicleId: van05.id,
      driverId: alex.id,
      source: 'Depot A',
      destination: 'Client X',
      cargoWeight: '500.00',
      plannedDistance: '45.00',
      actualDistance: '48.50',
      fuelConsumed: '4.20',
      status: 'completed',
      startedAt: new Date('2026-07-10T08:00:00Z'),
      completedAt: new Date('2026-07-10T10:30:00Z'),
    },
    {
      tripNumber: 'TR002',
      vehicleId: truck11.id,
      driverId: john.id,
      source: 'Depot B',
      destination: 'Port Z',
      cargoWeight: '15000.00',
      plannedDistance: '350.00',
      actualDistance: '355.00',
      fuelConsumed: '85.00',
      status: 'completed',
      startedAt: new Date('2026-07-09T06:00:00Z'),
      completedAt: new Date('2026-07-09T14:00:00Z'),
    },
    {
      tripNumber: 'TR003',
      vehicleId: mini03.id,
      driverId: priya.id,
      source: 'Depot A',
      destination: 'Store Y',
      cargoWeight: '300.00',
      plannedDistance: '15.00',
      status: 'dispatched',
      startedAt: new Date(),
    },
    {
      tripNumber: 'TR004',
      vehicleId: van09.id,
      driverId: suresh.id,
      source: 'Depot C',
      destination: 'Client W',
      cargoWeight: '1200.00',
      plannedDistance: '120.00',
      status: 'draft',
    },
    {
      tripNumber: 'TR005',
      vehicleId: truck11.id,
      driverId: john.id,
      source: 'Port Z',
      destination: 'Depot A',
      cargoWeight: '14500.00',
      plannedDistance: '350.00',
      status: 'draft',
    },
    {
      tripNumber: 'TR006',
      vehicleId: van05.id,
      driverId: alex.id,
      source: 'Depot B',
      destination: 'Client V',
      cargoWeight: '400.00',
      plannedDistance: '60.00',
      status: 'draft',
    },
  ];

  for (const t of tripsData) {
    await prisma.trip.upsert({
      where: { tripNumber: t.tripNumber },
      update: t,
      create: t,
    });
  }

  const tr001 = await prisma.trip.findUnique({ where: { tripNumber: 'TR001' }});
  const tr002 = await prisma.trip.findUnique({ where: { tripNumber: 'TR002' }});

  // Maintenance Logs
  await prisma.maintenanceLog.upsert({
    where: { workOrderNumber: 'WO-101' },
    update: {},
    create: {
      workOrderNumber: 'WO-101',
      vehicleId: van05.id,
      maintenanceType: 'oil_change',
      description: 'Routine oil change.',
      cost: '120.00',
      status: 'completed',
      startedAt: new Date('2026-06-15T09:00:00Z'),
      completedAt: new Date('2026-06-15T11:00:00Z'),
    },
  });

  await prisma.maintenanceLog.upsert({
    where: { workOrderNumber: 'WO-102' },
    update: {},
    create: {
      workOrderNumber: 'WO-102',
      vehicleId: truck11.id,
      maintenanceType: 'brake_service',
      description: 'Replace brake pads.',
      cost: '450.00',
      status: 'scheduled',
    },
  });

  // Fuel Logs
  await prisma.fuelLog.upsert({
    where: { receiptNumber: 'FL-201' },
    update: {},
    create: {
      receiptNumber: 'FL-201',
      tripId: tr001.id,
      vehicleId: van05.id,
      liters: '30.00',
      costPerLiter: '1.50',
      totalCost: '45.00',
      odometerReading: '45048.50',
      loggedAt: new Date('2026-07-10T10:45:00Z'),
    },
  });

  await prisma.fuelLog.upsert({
    where: { receiptNumber: 'FL-202' },
    update: {},
    create: {
      receiptNumber: 'FL-202',
      tripId: tr002.id,
      vehicleId: truck11.id,
      liters: '120.00',
      costPerLiter: '1.45',
      totalCost: '174.00',
      odometerReading: '120855.00',
      loggedAt: new Date('2026-07-09T14:15:00Z'),
    },
  });

  // Expenses
  await prisma.expense.upsert({
    where: { expenseNumber: 'EX-301' },
    update: {},
    create: {
      expenseNumber: 'EX-301',
      tripId: tr001.id,
      vehicleId: van05.id,
      category: 'parking',
      amount: '15.00',
      description: 'Client X parking fee.',
      incurredAt: new Date('2026-07-10T09:30:00Z'),
    },
  });

  await prisma.expense.upsert({
    where: { expenseNumber: 'EX-302' },
    update: {},
    create: {
      expenseNumber: 'EX-302',
      tripId: tr002.id,
      vehicleId: truck11.id,
      category: 'toll',
      amount: '45.00',
      description: 'Highway toll.',
      incurredAt: new Date('2026-07-09T10:00:00Z'),
    },
  });
}

async function main() {
  // Clean up stale data from previous schema/role changes
  await prisma.settings.deleteMany({});
  await prisma.securityLog.deleteMany({});

  // Remove any roles that are no longer part of the 4-role system
  const validRoleNames = ['fleet_manager', 'dispatcher', 'safety_officer', 'financial_analyst'];
  const staleRoles = await prisma.role.findMany({ where: { name: { notIn: validRoleNames } } });
  for (const r of staleRoles) {
    await prisma.userRole.deleteMany({ where: { roleId: r.id } });
    await prisma.role.delete({ where: { id: r.id } });
  }

  // Remove any users whose email is not in the seeded set
  const validEmails = ['manager@gmail.com', 'dispatcher@gmail.com', 'safety@gmail.com', 'analyst@gmail.com'];
  const staleUsers = await prisma.user.findMany({ where: { email: { notIn: validEmails } } });
  for (const u of staleUsers) {
    await prisma.userRole.deleteMany({ where: { userId: u.id } });
    await prisma.user.delete({ where: { id: u.id } });
  }

  await seedSettings();
  await seedSecurityLogs();

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
