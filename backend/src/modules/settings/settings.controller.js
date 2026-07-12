const settingsService = require('./settings.service');
const { successResponse } = require('../../utils/response');
const asyncHandler = require('../../middleware/asyncHandler');
const { updateSettingsSchema, updateRbacSchema } = require('./settings.validator');
const ApiError = require('../../utils/ApiError');

const getSettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.getSettings();
  return successResponse(res, 200, 'Settings retrieved successfully', settings);
});

const updateSettings = asyncHandler(async (req, res) => {
  const parsed = updateSettingsSchema.safeParse({ body: req.body });
  if (!parsed.success) {
    throw new ApiError(400, 'Validation Error: ' + parsed.error.errors.map(e => e.message).join(', '));
  }

  const settings = await settingsService.updateSettings(parsed.data.body, req.user?.id);
  return successResponse(res, 200, 'Settings updated successfully', settings);
});

const updateRbacMatrix = asyncHandler(async (req, res) => {
  const parsed = updateRbacSchema.safeParse({ body: req.body });
  if (!parsed.success) {
    throw new ApiError(400, 'Validation Error: ' + parsed.error.errors.map(e => e.message).join(', '));
  }

  const settings = await settingsService.updateRbacMatrix(parsed.data.body.rbacMatrix, req.user?.id);
  
  if (req.app.get('io')) {
    req.app.get('io').emit('settings:rbac-updated', settings);
  }

  return successResponse(res, 200, 'RBAC permissions updated successfully', settings);
});

const getSecurityLogs = asyncHandler(async (req, res) => {
  const logs = await settingsService.getSecurityLogs();
  return successResponse(res, 200, 'Security logs retrieved successfully', logs);
});

module.exports = {
  getSettings,
  updateSettings,
  updateRbacMatrix,
  getSecurityLogs,
};
