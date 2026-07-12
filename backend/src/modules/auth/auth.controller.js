const asyncHandler = require('../../utils/asyncHandler');
const authService = require('./auth.service');
const { registerSchema, loginSchema } = require('./auth.validator');
const ApiError = require('../../utils/ApiError');
const prisma = require('../../config/database');

const register = asyncHandler(async (req, res) => {
  const parsed = registerSchema.safeParse({ body: req.body });
  if (!parsed.success) {
    throw new ApiError(400, 'Validation Error: ' + parsed.error.errors.map(e => e.message).join(', '));
  }
  
  const user = await authService.register(parsed.data.body);
  res.status(201).json({
    status: 'success',
    data: { user },
  });
});

const login = asyncHandler(async (req, res) => {
  const parsed = loginSchema.safeParse({ body: req.body });
  if (!parsed.success) {
    throw new ApiError(400, 'Validation Error: ' + parsed.error.errors.map(e => e.message).join(', '));
  }

  const result = await authService.login(parsed.data.body);
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

const getMe = asyncHandler(async (req, res) => {
  const settings = await prisma.settings.findFirst();
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user,
      settings: settings ? {
        depotName: settings.depotName,
        currency: settings.currency,
        distanceUnit: settings.distanceUnit,
        rbacMatrix: settings.rbacMatrix
      } : null
    },
  });
});

module.exports = {
  register,
  login,
  getMe,
};
