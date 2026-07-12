const ApiError = require('../utils/ApiError');

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(403, 'Forbidden: Insufficient permissions');
    }
    
    let userRoles = [];
    if (Array.isArray(req.user.roles)) {
      userRoles = req.user.roles;
    } else if (req.user.role) {
      userRoles = [req.user.role];
    }
    
    const hasRole = userRoles.some(r => roles.includes(r));
    
    if (!hasRole) {
      throw new ApiError(403, 'Forbidden: Insufficient permissions');
    }
    
    next();
  };
};

module.exports = requireRole;
