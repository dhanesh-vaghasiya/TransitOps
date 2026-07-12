const vehicleService = require('./vehicle.service');
const { successResponse } = require('../../utils/response');
const asyncHandler = require('../../middleware/asyncHandler');

const createVehicle = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.createVehicle(req.body);
  
  if (req.app.get('io')) {
    req.app.get('io').emit('vehicle:status-changed', vehicle);
  }

  return successResponse(res, 201, 'Vehicle created successfully', vehicle);
});

const getVehicles = asyncHandler(async (req, res) => {
  const filters = {
    type: req.query.type,
    status: req.query.status,
    search: req.query.search
  };
  
  const vehicles = await vehicleService.getVehicles(filters);
  return successResponse(res, 200, 'Vehicles retrieved successfully', vehicles);
});

const getVehicleById = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.getVehicleById(req.params.id);
  return successResponse(res, 200, 'Vehicle retrieved successfully', vehicle);
});

const updateVehicle = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.updateVehicle(req.params.id, req.body);
  
  if (req.app.get('io')) {
    req.app.get('io').emit('vehicle:status-changed', vehicle);
  }

  return successResponse(res, 200, 'Vehicle updated successfully', vehicle);
});

const deleteVehicle = asyncHandler(async (req, res) => {
  await vehicleService.deleteVehicle(req.params.id);
  
  if (req.app.get('io')) {
    req.app.get('io').emit('vehicle:deleted', { id: parseInt(req.params.id, 10) });
  }

  return successResponse(res, 200, 'Vehicle deleted successfully', null);
});

const getDispatchPool = asyncHandler(async (req, res) => {
  const vehicles = await vehicleService.getDispatchPool();
  return successResponse(res, 200, 'Dispatch pool retrieved successfully', vehicles);
});

const getOperationalCost = asyncHandler(async (req, res) => {
  const costData = await vehicleService.getOperationalCost(req.params.id);
  return successResponse(res, 200, 'Operational cost retrieved successfully', costData);
});

module.exports = {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  getDispatchPool,
  getOperationalCost
};
