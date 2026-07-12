const asyncHandler = require('../../middleware/asyncHandler');
const { successResponse } = require('../../utils/response');
const expenseService = require('./expense.service');

const listExpenses = asyncHandler(async (req, res) => {
  const expenses = await expenseService.getAllExpenses();
  return successResponse(res, 200, 'Expenses retrieved successfully', { expenses });
});

const createExpense = asyncHandler(async (req, res) => {
  const result = await expenseService.createExpense(req.body);
  return successResponse(res, 201, 'Expense created successfully', result);
});

module.exports = {
  listExpenses,
  createExpense,
};
