const asyncHandler = require('../../utils/asyncHandler');
const maintenanceService = require('./maintenance.service');
const { createMaintenanceSchema, updateMaintenanceSchema, getMaintenanceSchema } = require('./maintenance.validator');
const ApiError = require('../../utils/ApiError');
const { successResponse } = require('../../utils/response');

const getAllMaintenance = asyncHandler(async (req, res) => {
  const logs = await maintenanceService.getAllMaintenanceLogs();
  successResponse(res, 200, 'Maintenance logs fetched successfully', { maintenanceLogs: logs });
});

const getMaintenanceById = asyncHandler(async (req, res) => {
  const parsed = getMaintenanceSchema.safeParse({ params: req.params });
  if (!parsed.success) {
    throw new ApiError(400, 'Validation Error: ' + parsed.error.issues.map(e => e.message).join(', '));
  }
  const log = await maintenanceService.getMaintenanceById(parsed.data.params.id);
  if (!log) throw new ApiError(404, 'Maintenance log not found');
  successResponse(res, 200, 'Maintenance log fetched successfully', { maintenanceLog: log });
});

const createMaintenance = asyncHandler(async (req, res) => {
  const parsed = createMaintenanceSchema.safeParse({ body: req.body });
  if (!parsed.success) {
    throw new ApiError(400, 'Validation Error: ' + parsed.error.issues.map(e => e.message).join(', '));
  }
  
  const vehicle = await maintenanceService.checkVehicleStatus(parsed.data.body.vehicleId);
  if (!vehicle) {
    throw new ApiError(404, 'Vehicle not found');
  }

  try {
    const log = await maintenanceService.createMaintenance(parsed.data.body);
    
    // The DB trigger trg_maintenance_started handles setting vehicle status to in_shop
    // We emit the socket event so the UI updates
    if (log.status === 'in_progress') {
      const io = req.app.get('io');
      if (io) io.emit('vehicle:status-changed', { vehicleId: vehicle.id, status: 'in_shop' });
    }

    successResponse(res, 201, 'Maintenance record created successfully', { maintenanceLog: log });
  } catch (error) {
    if (error.code === 'P2002') {
      throw new ApiError(409, 'Maintenance with this work order number already exists');
    }
    throw error;
  }
});

const updateMaintenance = asyncHandler(async (req, res) => {
  const parsed = updateMaintenanceSchema.safeParse({ body: req.body, params: req.params });
  if (!parsed.success) {
    throw new ApiError(400, 'Validation Error: ' + parsed.error.issues.map(e => e.message).join(', '));
  }

  const existingLog = await maintenanceService.getMaintenanceById(parsed.data.params.id);
  if (!existingLog) {
    throw new ApiError(404, 'Maintenance log not found');
  }

  // Guard against closing maintenance on a retired vehicle
  if (parsed.data.body.status === 'completed' && existingLog.vehicle.status === 'retired') {
    throw new ApiError(400, 'Cannot complete maintenance for a retired vehicle');
  }

  try {
    const log = await maintenanceService.updateMaintenance(parsed.data.params.id, parsed.data.body);

    const io = req.app.get('io');
    if (io) {
      if (parsed.data.body.status === 'in_progress' && existingLog.status !== 'in_progress') {
        io.emit('vehicle:status-changed', { vehicleId: log.vehicleId, status: 'in_shop' });
      } else if (parsed.data.body.status === 'completed' && existingLog.status !== 'completed') {
        io.emit('vehicle:status-changed', { vehicleId: log.vehicleId, status: 'available' });
      }
    }

    successResponse(res, 200, 'Maintenance record updated successfully', { maintenanceLog: log });
  } catch (error) {
    throw error;
  }
});

module.exports = {
  getAllMaintenance,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
};
