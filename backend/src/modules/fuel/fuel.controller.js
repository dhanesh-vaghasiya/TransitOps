const asyncHandler = require('../../middleware/asyncHandler');
const { successResponse } = require('../../utils/response');
const fuelService = require('./fuel.service');
const { generatePagination } = require('../../utils/helpers');

const listFuelLogs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 50;

  const { fuelLogs, total } = await fuelService.getAllFuelLogs({ page, limit });
  const pagination = generatePagination(page, limit, total);

  return successResponse(res, 200, 'Fuel logs retrieved successfully', {
    fuelLogs,
    pagination,
  });
});

const createFuelLog = asyncHandler(async (req, res) => {
  const result = await fuelService.createFuelLog(req.body);
  return successResponse(res, 201, 'Fuel log created successfully', result);
});

module.exports = {
  listFuelLogs,
  createFuelLog,
};
