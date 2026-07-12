const asyncHandler = require('../../utils/asyncHandler');
const driverService = require('./driver.service');
const { createDriverSchema, updateDriverSchema, getDriverSchema } = require('./driver.validator');
const ApiError = require('../../utils/ApiError');
const { successResponse } = require('../../utils/response');

const getAllDrivers = asyncHandler(async (req, res) => {
  const drivers = await driverService.getAllDrivers();
  successResponse(res, 200, 'Drivers fetched successfully', { drivers });
});

const getDispatchPool = asyncHandler(async (req, res) => {
  const drivers = await driverService.getDispatchPool();
  successResponse(res, 200, 'Dispatch pool fetched successfully', { drivers });
});

const getDriverById = asyncHandler(async (req, res) => {
  const parsed = getDriverSchema.safeParse({ params: req.params });
  if (!parsed.success) {
    throw new ApiError(400, 'Validation Error: ' + parsed.error.issues.map(e => e.message).join(', '));
  }
  const driver = await driverService.getDriverById(parsed.data.params.id);
  if (!driver) {
    throw new ApiError(404, 'Driver not found');
  }
  successResponse(res, 200, 'Driver fetched successfully', { driver });
});

const createDriver = asyncHandler(async (req, res) => {
  const parsed = createDriverSchema.safeParse({ body: req.body });
  if (!parsed.success) {
    throw new ApiError(400, 'Validation Error: ' + parsed.error.issues.map(e => e.message).join(', '));
  }
  
  try {
    const driver = await driverService.createDriver(parsed.data.body);
    successResponse(res, 201, 'Driver created successfully', { driver });
  } catch (error) {
    if (error.code === 'P2002') {
      throw new ApiError(409, 'Driver with this license number already exists');
    }
    throw error;
  }
});

const updateDriver = asyncHandler(async (req, res) => {
  const parsed = updateDriverSchema.safeParse({ body: req.body, params: req.params });
  if (!parsed.success) {
    throw new ApiError(400, 'Validation Error: ' + parsed.error.issues.map(e => e.message).join(', '));
  }
  
  const existingDriver = await driverService.getDriverById(parsed.data.params.id);
  if (!existingDriver) {
    throw new ApiError(404, 'Driver not found');
  }

  try {
    const driver = await driverService.updateDriver(parsed.data.params.id, parsed.data.body);

    // Emit socket event if status changed
    if (parsed.data.body.status && existingDriver.status !== parsed.data.body.status) {
      const io = req.app.get('io');
      if (io) {
        io.emit('driver:status-changed', { driverId: driver.id, status: driver.status });
      }
    }

    successResponse(res, 200, 'Driver updated successfully', { driver });
  } catch (error) {
    if (error.code === 'P2002') {
      throw new ApiError(409, 'Driver with this license number already exists');
    }
    throw error;
  }
});

const deleteDriver = asyncHandler(async (req, res) => {
  const parsed = getDriverSchema.safeParse({ params: req.params });
  if (!parsed.success) {
    throw new ApiError(400, 'Validation Error: ' + parsed.error.issues.map(e => e.message).join(', '));
  }
  const existingDriver = await driverService.getDriverById(parsed.data.params.id);
  if (!existingDriver) {
    throw new ApiError(404, 'Driver not found');
  }
  await driverService.deleteDriver(parsed.data.params.id);
  successResponse(res, 200, 'Driver deleted successfully');
});

module.exports = {
  getAllDrivers,
  getDispatchPool,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
};
