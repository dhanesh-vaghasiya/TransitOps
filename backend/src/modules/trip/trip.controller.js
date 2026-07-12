const asyncHandler = require('../../middleware/asyncHandler');
const { successResponse } = require('../../utils/response');
const tripService = require('./trip.service');

const listTrips = asyncHandler(async (req, res) => {
  const { status, page, limit } = req.query;
  const result = await tripService.getAllTrips({
    status,
    page: page ? parseInt(page, 10) : 1,
    limit: limit ? parseInt(limit, 10) : 50,
  });
  return successResponse(res, 200, 'Trips retrieved successfully', result);
});

const createTrip = asyncHandler(async (req, res) => {
  const trip = await tripService.createTrip(req.body);
  return successResponse(res, 201, 'Trip created successfully', { trip });
});

const getTrip = asyncHandler(async (req, res) => {
  const trip = await tripService.getTripById(parseInt(req.params.id, 10));
  return successResponse(res, 200, 'Trip retrieved successfully', { trip });
});

const dispatchTrip = asyncHandler(async (req, res) => {
  const trip = await tripService.dispatchTrip(parseInt(req.params.id, 10));
  return successResponse(res, 200, 'Trip dispatched successfully', { trip });
});

const completeTrip = asyncHandler(async (req, res) => {
  const trip = await tripService.completeTrip(parseInt(req.params.id, 10), req.body);
  return successResponse(res, 200, 'Trip completed successfully', { trip });
});

const cancelTrip = asyncHandler(async (req, res) => {
  const trip = await tripService.cancelTrip(parseInt(req.params.id, 10));
  return successResponse(res, 200, 'Trip cancelled successfully', { trip });
});

const getDispatchPool = asyncHandler(async (req, res) => {
  const [vehicles, drivers] = await Promise.all([
    tripService.getDispatchPoolVehicles(),
    tripService.getDispatchPoolDrivers(),
  ]);
  return successResponse(res, 200, 'Dispatch pool retrieved successfully', { vehicles, drivers });
});

module.exports = {
  listTrips,
  createTrip,
  getTrip,
  dispatchTrip,
  completeTrip,
  cancelTrip,
  getDispatchPool,
};
