const { PrismaClient, LicenseCategory } = require('@prisma/client');

const prisma = new PrismaClient();

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
      email: 'manager@gmail.com',
      passwordHash: '$2b$10$1btSK8T2pB5AEKO3mFkEQ.1ik/Ayai0jkBxYJs5JQz/fLCAvz8lrO', // manager123
      fullName: 'Fleet Manager',
      roles: ['fleet_manager', 'financial_analyst'],
    },
    {
      email: 'safety@gmail.com',
      passwordHash: '$2b$10$ybGPdIFc81VHm2FBAQVC5OwTQXv401.NU4A5FUB06BS.eCzNOQ5X2', // safety123
      fullName: 'Safety Officer',
      roles: ['safety_officer'],
    },
    {
      email: 'driver@gmail.com',
      passwordHash: '$2b$10$e0aewc4VF.Mvgn9W0oSnRe39Zg96OUmcyuXhE53wvh8AcuMJEv3z6', // driver123
      fullName: 'Demo Driver',
      roles: ['driver'],
    },
  ];

  for (const user of users) {
    const savedUser = await prisma.user.upsert({
      where: { email: user.email },
      update: { fullName: user.fullName, status: 'active' },
      create: { email: user.email, passwordHash: user.passwordHash, fullName: user.fullName, status: 'active' },
    });

    for (const roleName of user.roles) {
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: savedUser.id, roleId: roleByName[roleName].id } },
        update: {},
        create: { userId: savedUser.id, roleId: roleByName[roleName].id },
      });
    }
  }
}

async function seedSettings() {
  await prisma.settings.create({
    data: { depotName: 'Central Transit Depot', currency: 'USD', distanceUnit: 'km' },
  });
}

async function seedVehicles() {
  const vehicles = [
    { registrationNumber: 'VAN-05', name: 'City Delivery Van', model: 'Ford Transit', type: 'van', maxLoadCapacity: '1500', odometer: '45000', acquisitionCost: '35000', status: 'available' },
    { registrationNumber: 'TRUCK-11', name: 'Heavy Freight Truck', model: 'Volvo FH16', type: 'truck', maxLoadCapacity: '18000', odometer: '120500', acquisitionCost: '120000', status: 'available' },
    { registrationNumber: 'MINI-03', name: 'Express Mini Lorry', model: 'Tata Ace', type: 'lorry', maxLoadCapacity: '800', odometer: '15000', acquisitionCost: '15000', status: 'available' },
    { registrationNumber: 'VAN-09', name: 'Suburban Delivery Van', model: 'Mercedes Sprinter', type: 'van', maxLoadCapacity: '1600', odometer: '32000', acquisitionCost: '42000', status: 'on_trip' },
    { registrationNumber: 'TRUCK-12', name: 'Long Haul Truck', model: 'Scania R500', type: 'truck', maxLoadCapacity: '22000', odometer: '210000', acquisitionCost: '135000', status: 'available' },
    { registrationNumber: 'BUS-01', name: 'Staff Commute Bus', model: 'Volvo B11R', type: 'bus', maxLoadCapacity: '5000', odometer: '85000', acquisitionCost: '95000', status: 'available' },
    { registrationNumber: 'CAR-07', name: 'Executive Sedan', model: 'Honda City', type: 'car', maxLoadCapacity: '400', odometer: '12000', acquisitionCost: '22000', status: 'in_shop' },
    { registrationNumber: 'BIKE-22', name: 'Express Courier Bike', model: 'Honda Shine', type: 'bike', maxLoadCapacity: '50', odometer: '8000', acquisitionCost: '1500', status: 'available' },
    { registrationNumber: 'LORRY-04', name: 'Construction Lorry', model: 'Ashok Leyland', type: 'lorry', maxLoadCapacity: '8000', odometer: '115000', acquisitionCost: '65000', status: 'on_trip' },
    { registrationNumber: 'VAN-10', name: 'Medical Supply Van', model: 'Toyota HiAce', type: 'van', maxLoadCapacity: '1200', odometer: '18000', acquisitionCost: '28000', status: 'available' },
    { registrationNumber: 'TRUCK-15', name: 'Refrigerated Truck', model: 'MAN TGX', type: 'truck', maxLoadCapacity: '16000', odometer: '65000', acquisitionCost: '110000', status: 'in_shop' },
    { registrationNumber: 'CAR-02', name: 'Operations Car', model: 'Maruti Dzire', type: 'car', maxLoadCapacity: '400', odometer: '45000', acquisitionCost: '12000', status: 'available' },
    { registrationNumber: 'BIKE-09', name: 'Food Delivery Bike', model: 'Hero Splendor', type: 'bike', maxLoadCapacity: '50', odometer: '12000', acquisitionCost: '1200', status: 'on_trip' },
    { registrationNumber: 'BUS-03', name: 'Intercity Bus', model: 'Scania Metrolink', type: 'bus', maxLoadCapacity: '6000', odometer: '190000', acquisitionCost: '140000', status: 'available' }
  ];

  const saved = [];
  for (const vehicle of vehicles) {
    saved.push(await prisma.vehicle.upsert({
      where: { registrationNumber: vehicle.registrationNumber },
      update: vehicle,
      create: vehicle,
    }));
  }
  return saved;
}

async function seedDrivers() {
  const drivers = [
    { name: 'Alex Johnson', licenseNumber: 'LIC-ALEX-001', licenseCategory: 'van', licenseExpiry: new Date('2028-05-20'), contactNumber: '555-0101', safetyScore: '98.50', status: 'available' },
    { name: 'John Doe', licenseNumber: 'LIC-JOHN-002', licenseCategory: 'truck', licenseExpiry: new Date('2027-11-15'), contactNumber: '555-0102', safetyScore: '95.00', status: 'available' },
    { name: 'Priya Patel', licenseNumber: 'LIC-PRIYA-003', licenseCategory: 'lorry', licenseExpiry: new Date('2029-02-10'), contactNumber: '555-0103', safetyScore: '99.00', status: 'available' },
    { name: 'Suresh Kumar', licenseNumber: 'LIC-SURESH-004', licenseCategory: 'van', licenseExpiry: new Date('2026-12-31'), contactNumber: '555-0104', safetyScore: '92.50', status: 'on_trip' },
    { name: 'Michael Smith', licenseNumber: 'LIC-MIKE-005', licenseCategory: 'truck', licenseExpiry: new Date('2028-08-11'), contactNumber: '555-0105', safetyScore: '88.00', status: 'available' },
    { name: 'Sarah Connor', licenseNumber: 'LIC-SARA-006', licenseCategory: 'bus', licenseExpiry: new Date('2030-01-01'), contactNumber: '555-0106', safetyScore: '100.00', status: 'available' },
    { name: 'David Lee', licenseNumber: 'LIC-DAVE-007', licenseCategory: 'car', licenseExpiry: new Date('2027-04-20'), contactNumber: '555-0107', safetyScore: '96.50', status: 'suspended' },
    { name: 'Raj Singh', licenseNumber: 'LIC-RAJ-008', licenseCategory: 'bike', licenseExpiry: new Date('2029-09-09'), contactNumber: '555-0108', safetyScore: '94.00', status: 'available' },
    { name: 'Emily Davis', licenseNumber: 'LIC-EMILY-009', licenseCategory: 'lorry', licenseExpiry: new Date('2028-11-22'), contactNumber: '555-0109', safetyScore: '97.00', status: 'on_trip' },
    { name: 'Tom Hanks', licenseNumber: 'LIC-TOM-010', licenseCategory: 'truck', licenseExpiry: new Date('2027-07-07'), contactNumber: '555-0110', safetyScore: '89.50', status: 'off_duty' },
    { name: 'Anita Bose', licenseNumber: 'LIC-ANITA-011', licenseCategory: 'car', licenseExpiry: new Date('2029-03-15'), contactNumber: '555-0111', safetyScore: '99.50', status: 'available' },
    { name: 'Carlos Ray', licenseNumber: 'LIC-CARLOS-012', licenseCategory: 'bike', licenseExpiry: new Date('2028-06-30'), contactNumber: '555-0112', safetyScore: '91.00', status: 'on_trip' },
    { name: 'Linda Wu', licenseNumber: 'LIC-LINDA-013', licenseCategory: 'van', licenseExpiry: new Date('2031-12-12'), contactNumber: '555-0113', safetyScore: '95.50', status: 'available' }
  ];

  const saved = [];
  for (const driver of drivers) {
    saved.push(await prisma.driver.upsert({
      where: { licenseNumber: driver.licenseNumber },
      update: driver,
      create: driver,
    }));
  }
  return saved;
}

async function seedOperations(vehicles, drivers) {
  const getV = (reg) => vehicles.find(v => v.registrationNumber === reg).id;
  const getD = (name) => drivers.find(d => d.name === name).id;

  const tripsData = [
    { tripNumber: 'TR-2026-001', vehicleId: getV('VAN-05'), driverId: getD('Alex Johnson'), source: 'Central Hub', destination: 'North District', cargoWeight: '500', plannedDistance: '45', actualDistance: '48', fuelConsumed: '4.5', status: 'completed', startedAt: new Date(Date.now() - 86400000 * 5), completedAt: new Date(Date.now() - 86400000 * 4) },
    { tripNumber: 'TR-2026-002', vehicleId: getV('TRUCK-11'), driverId: getD('John Doe'), source: 'Port City', destination: 'Inland Depot', cargoWeight: '15000', plannedDistance: '350', actualDistance: '355', fuelConsumed: '85', status: 'completed', startedAt: new Date(Date.now() - 86400000 * 4), completedAt: new Date(Date.now() - 86400000 * 3) },
    { tripNumber: 'TR-2026-003', vehicleId: getV('MINI-03'), driverId: getD('Priya Patel'), source: 'Warehouse A', destination: 'Retail Store B', cargoWeight: '300', plannedDistance: '15', actualDistance: '16', fuelConsumed: '2', status: 'completed', startedAt: new Date(Date.now() - 86400000 * 2), completedAt: new Date(Date.now() - 86400000 * 1) },
    { tripNumber: 'TR-2026-004', vehicleId: getV('VAN-09'), driverId: getD('Suresh Kumar'), source: 'South Depot', destination: 'East Wing', cargoWeight: '1200', plannedDistance: '120', status: 'dispatched', startedAt: new Date(Date.now() - 3600000 * 2) },
    { tripNumber: 'TR-2026-005', vehicleId: getV('TRUCK-12'), driverId: getD('Michael Smith'), source: 'Border Checkpoint', destination: 'Central Hub', cargoWeight: '20000', plannedDistance: '800', status: 'draft' },
    { tripNumber: 'TR-2026-006', vehicleId: getV('LORRY-04'), driverId: getD('Emily Davis'), source: 'Construction Site 1', destination: 'Supplier X', cargoWeight: '7500', plannedDistance: '80', status: 'dispatched', startedAt: new Date(Date.now() - 3600000 * 5) },
    { tripNumber: 'TR-2026-007', vehicleId: getV('BIKE-09'), driverId: getD('Carlos Ray'), source: 'Kitchen Base', destination: 'Office Complex', cargoWeight: '15', plannedDistance: '8', status: 'dispatched', startedAt: new Date(Date.now() - 1800000) },
    { tripNumber: 'TR-2026-008', vehicleId: getV('BUS-01'), driverId: getD('Sarah Connor'), source: 'Downtown', destination: 'Tech Park', cargoWeight: '0', plannedDistance: '25', actualDistance: '25', fuelConsumed: '5', status: 'completed', startedAt: new Date(Date.now() - 86400000 * 10), completedAt: new Date(Date.now() - 86400000 * 9) },
    { tripNumber: 'TR-2026-009', vehicleId: getV('VAN-10'), driverId: getD('Linda Wu'), source: 'Pharma Dist', destination: 'City Hospital', cargoWeight: '800', plannedDistance: '35', status: 'cancelled' },
    { tripNumber: 'TR-2026-010', vehicleId: getV('CAR-02'), driverId: getD('Anita Bose'), source: 'HQ', destination: 'Airport', cargoWeight: '20', plannedDistance: '40', status: 'draft' },
  ];

  for (const t of tripsData) {
    await prisma.trip.upsert({ where: { tripNumber: t.tripNumber }, update: t, create: t });
  }

  const tr1 = await prisma.trip.findUnique({ where: { tripNumber: 'TR-2026-001' }});
  const tr2 = await prisma.trip.findUnique({ where: { tripNumber: 'TR-2026-002' }});
  const tr8 = await prisma.trip.findUnique({ where: { tripNumber: 'TR-2026-008' }});

  // Maintenance Logs
  await prisma.maintenanceLog.upsert({
    where: { workOrderNumber: 'WO-101' }, update: {},
    create: { workOrderNumber: 'WO-101', vehicleId: getV('VAN-05'), maintenanceType: 'oil_change', description: 'Routine oil change.', cost: '120.00', status: 'completed', startedAt: new Date('2026-06-15T09:00:00Z'), completedAt: new Date('2026-06-15T11:00:00Z') }
  });

  await prisma.maintenanceLog.upsert({
    where: { workOrderNumber: 'WO-102' }, update: {},
    create: { workOrderNumber: 'WO-102', vehicleId: getV('CAR-07'), maintenanceType: 'engine_repair', description: 'Fixing transmission slip.', cost: '1450.00', status: 'in_progress', startedAt: new Date(Date.now() - 86400000 * 2) }
  });

  await prisma.maintenanceLog.upsert({
    where: { workOrderNumber: 'WO-103' }, update: {},
    create: { workOrderNumber: 'WO-103', vehicleId: getV('TRUCK-15'), maintenanceType: 'brake_service', description: 'Replace brake pads and rotors.', cost: '850.00', status: 'scheduled' }
  });

  // Fuel Logs
  await prisma.fuelLog.upsert({
    where: { receiptNumber: 'FL-201' }, update: {},
    create: { receiptNumber: 'FL-201', tripId: tr1.id, vehicleId: tr1.vehicleId, liters: '30', costPerLiter: '1.50', totalCost: '45.00', odometerReading: '45048', loggedAt: tr1.completedAt }
  });

  await prisma.fuelLog.upsert({
    where: { receiptNumber: 'FL-202' }, update: {},
    create: { receiptNumber: 'FL-202', tripId: tr2.id, vehicleId: tr2.vehicleId, liters: '120', costPerLiter: '1.45', totalCost: '174.00', odometerReading: '120855', loggedAt: tr2.completedAt }
  });

  await prisma.fuelLog.upsert({
    where: { receiptNumber: 'FL-203' }, update: {},
    create: { receiptNumber: 'FL-203', tripId: tr8.id, vehicleId: tr8.vehicleId, liters: '45', costPerLiter: '1.30', totalCost: '58.50', odometerReading: '85025', loggedAt: tr8.completedAt }
  });

  // Expenses
  await prisma.expense.upsert({
    where: { expenseNumber: 'EX-301' }, update: {},
    create: { expenseNumber: 'EX-301', tripId: tr1.id, vehicleId: tr1.vehicleId, category: 'parking', amount: '15.00', description: 'Client X parking fee.', incurredAt: tr1.startedAt }
  });

  await prisma.expense.upsert({
    where: { expenseNumber: 'EX-302' }, update: {},
    create: { expenseNumber: 'EX-302', tripId: tr2.id, vehicleId: tr2.vehicleId, category: 'toll', amount: '45.00', description: 'Highway toll.', incurredAt: tr2.startedAt }
  });
  
  await prisma.expense.upsert({
    where: { expenseNumber: 'EX-303' }, update: {},
    create: { expenseNumber: 'EX-303', tripId: null, vehicleId: getV('BUS-01'), category: 'insurance', amount: '1200.00', description: 'Annual Insurance Renewal', incurredAt: new Date(Date.now() - 86400000 * 30) }
  });
}

async function main() {
  await prisma.settings.deleteMany({});
  await seedSettings();
  
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
