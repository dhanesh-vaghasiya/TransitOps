const ApiError = require('../utils/ApiError');

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles) {
      return next(new ApiError(403, 'User not authenticated or roles missing'));
    }

    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));
    if (!hasRole) {
      return next(new ApiError(403, 'Forbidden: insufficient permissions'));
    }
    next();
  };
};

const fleetManagerOnly = authorize('fleet_manager');
const driverAndAbove = authorize('dispatcher', 'fleet_manager', 'safety_officer', 'financial_analyst');
const safetyAndAbove = authorize('safety_officer', 'fleet_manager');
const financeAndAbove = authorize('financial_analyst', 'fleet_manager');
const allRoles = authorize('dispatcher', 'fleet_manager', 'safety_officer', 'financial_analyst');
// Note: Depending on the specific roles required, expand these.

module.exports = {
  authorize,
  fleetManagerOnly,
  driverAndAbove,
  safetyAndAbove,
  financeAndAbove,
  allRoles,
};
