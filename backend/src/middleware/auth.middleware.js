const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const ApiError = require('../utils/ApiError');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new ApiError(401, 'Please authenticate'));
    }

    const token = authHeader.split(' ')[1];
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkeythatisatleast32charslong');
    } catch (err) {
      return next(new ApiError(401, 'Invalid or expired token'));
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        roles: {
          include: { role: true },
        },
      },
    });

    if (!user) {
      return next(new ApiError(401, 'User not found'));
    }

    if (user.status !== 'active') {
      return next(new ApiError(403, 'User account is inactive'));
    }

    const userRoles = user.roles.map(ur => ur.role.name);

    req.user = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      status: user.status,
      roles: userRoles,
    };

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { authenticate };
