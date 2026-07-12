const prisma = require('../../config/database');
const ApiError = require('../../utils/ApiError');

const getAllExpenses = async () => {
  // Fetch expenses
  const expensesList = await prisma.expense.findMany({
    orderBy: { incurredAt: 'desc' },
    include: {
      vehicle: {
        select: {
          id: true,
          name: true,
          registrationNumber: true,
        },
      },
      trip: {
        select: {
          id: true,
          tripNumber: true,
        },
      },
    },
  });

  // Fetch maintenance logs
  const maintenanceList = await prisma.maintenanceLog.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      vehicle: {
        select: {
          id: true,
          name: true,
          registrationNumber: true,
        },
      },
    },
  });

  // We can join with linked maintenance cost per trip/vehicle where applicable.
  // For each vehicle/trip, let's find the total maintenance cost of that vehicle so we can return it as "linkedMaintenanceCost".
  // Let's pre-calculate the sum of completed maintenance logs per vehicle.
  const maintenanceSums = await prisma.maintenanceLog.groupBy({
    by: ['vehicleId'],
    _sum: {
      cost: true,
    },
    where: {
      status: 'completed',
    },
  });

  const maintenanceMap = {};
  maintenanceSums.forEach((item) => {
    maintenanceMap[item.vehicleId] = parseFloat(item._sum.cost) || 0;
  });

  // Map expenses to unified structure
  const unifiedExpenses = [];

  expensesList.forEach((exp) => {
    unifiedExpenses.push({
      id: `exp-${exp.id}`,
      dbId: exp.id,
      ref: exp.expenseNumber,
      type: 'expense',
      category: exp.category, // 'toll', 'parking', 'fine', 'insurance', 'other'
      amount: parseFloat(exp.amount) || 0,
      description: exp.description || 'No description',
      status: 'cleared', // virtual status: Cleared
      incurredAt: exp.incurredAt,
      vehicle: exp.vehicle,
      trip: exp.trip,
      linkedMaintenanceCost: maintenanceMap[exp.vehicleId] || 0,
    });
  });

  maintenanceList.forEach((maint) => {
    // Map status: completed -> cleared, others -> pending
    const status = maint.status === 'completed' ? 'cleared' : 'pending';

    unifiedExpenses.push({
      id: `maint-${maint.id}`,
      dbId: maint.id,
      ref: maint.workOrderNumber,
      type: 'maintenance',
      category: 'maintenance',
      amount: parseFloat(maint.cost) || 0,
      description: maint.description || `${maint.maintenanceType.replace(/_/g, ' ')} service`,
      status: status,
      incurredAt: maint.completedAt || maint.startedAt || maint.createdAt,
      vehicle: maint.vehicle,
      trip: null,
      linkedMaintenanceCost: 0,
    });
  });

  // Sort unifiedExpenses by incurredAt descending
  unifiedExpenses.sort((a, b) => new Date(b.incurredAt) - new Date(a.incurredAt));

  return unifiedExpenses;
};

const createExpense = async (data) => {
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

  const expenseNumber = `EX-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

  const expense = await prisma.expense.create({
    data: {
      expenseNumber,
      tripId: data.tripId || null,
      vehicleId: data.vehicleId,
      category: data.category,
      amount: Number(data.amount),
      description: data.description || null,
      incurredAt: new Date(),
    },
    include: {
      vehicle: true,
      trip: true,
    },
  });

  return expense;
};

module.exports = {
  getAllExpenses,
  createExpense,
};
