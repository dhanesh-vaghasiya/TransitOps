const asyncHandler = require('../../middleware/asyncHandler');
const { successResponse } = require('../../utils/response');
const vehicleService = require('./vehicle.service');

const listVehicles = asyncHandler(async (req, res) => {
  const vehicles = await vehicleService.getVehicles();
  return successResponse(res, 200, 'Vehicles retrieved successfully', { vehicles });
});

const getOperationalCost = asyncHandler(async (req, res) => {
  const result = await vehicleService.getOperationalCost(parseInt(req.params.id, 10));
  return successResponse(res, 200, 'Operational cost retrieved successfully', result);
});

module.exports = {
  listVehicles,
  getOperationalCost,
};
