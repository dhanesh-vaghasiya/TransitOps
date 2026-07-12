const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../../config/database');
const ApiError = require('../../utils/ApiError');

// In-memory lockout tracking: email -> { attempts: number, lockedUntil: Date }
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 mins

const register = async ({ email, password, fullName, roles = [] }) => {
  const hashedPassword = await bcrypt.hash(password, 12);
  
  let roleConnections = [];
  if (roles && roles.length > 0) {
    const dbRoles = await prisma.role.findMany({
      where: { name: { in: roles } },
    });
    roleConnections = dbRoles.map((r) => ({
      role: { connect: { id: r.id } },
    }));
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  let user;
  if (existingUser) {
    // If the user already exists, update their record instead of throwing an error
    user = await prisma.user.update({
      where: { email },
      data: {
        passwordHash: hashedPassword,
        fullName,
        roles: {
          deleteMany: {}, // Remove existing roles
          create: roleConnections,
        },
      },
      include: {
        roles: {
          include: { role: true }
        }
      }
    });
  } else {
    // Otherwise create the new user
    user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        fullName,
        roles: {
          create: roleConnections,
        },
      },
      include: {
        roles: {
          include: { role: true }
        }
      }
    });
  }

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    status: user.status,
    roles: user.roles.map(ur => ur.role.name),
  };
};

const login = async ({ email, password }) => {
  const attemptRecord = loginAttempts.get(email);
  if (attemptRecord) {
    if (attemptRecord.lockedUntil && attemptRecord.lockedUntil > new Date()) {
      throw new ApiError(403, 'Account is locked due to too many failed login attempts. Please try again later.');
    }
    if (attemptRecord.lockedUntil && attemptRecord.lockedUntil <= new Date()) {
      // Reset lockout
      loginAttempts.delete(email);
    }
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      roles: {
        include: { role: true }
      }
    }
  });

  if (!user || user.status !== 'active') {
    if (user && user.status !== 'active') {
      await prisma.securityLog.create({
        data: { action: 'LOGIN_FAILED', details: `Failed login attempt: Account ${email} is inactive`, userId: user.id }
      });
      throw new ApiError(403, 'Account is inactive');
    }
    await prisma.securityLog.create({
      data: { action: 'LOGIN_FAILED', details: `Failed login attempt: Invalid email/credentials for ${email}` }
    });
    throw new ApiError(401, 'Invalid credentials');
  }

  const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordMatch) {
    const attempts = attemptRecord ? attemptRecord.attempts + 1 : 1;
    if (attempts >= MAX_ATTEMPTS) {
      loginAttempts.set(email, {
        attempts,
        lockedUntil: new Date(Date.now() + LOCKOUT_DURATION_MS),
      });
      await prisma.securityLog.create({
        data: { action: 'ACCOUNT_LOCKOUT', details: `Account ${email} locked out due to too many failed attempts`, userId: user.id }
      });
      throw new ApiError(403, 'Account is locked due to too many failed login attempts. Please try again later.');
    } else {
      loginAttempts.set(email, { attempts, lockedUntil: null });
      await prisma.securityLog.create({
        data: { action: 'LOGIN_FAILED', details: `Failed login attempt: Incorrect password for ${email}`, userId: user.id }
      });
      throw new ApiError(401, 'Invalid credentials');
    }
  }

  // Successful login, clear attempts
  loginAttempts.delete(email);

  await prisma.securityLog.create({
    data: { action: 'LOGIN_SUCCESS', details: `User ${user.email} logged in successfully`, userId: user.id }
  });

  const userRoles = user.roles.map(ur => ur.role.name);
  const token = jwt.sign(
    { userId: user.id, roles: userRoles },
    process.env.JWT_SECRET || 'supersecretjwtkeythatisatleast32charslong',
    { expiresIn: '8h' }
  );

  const settings = await prisma.settings.findFirst();

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      roles: userRoles,
      status: user.status,
    },
    settings: settings ? {
      depotName: settings.depotName,
      currency: settings.currency,
      distanceUnit: settings.distanceUnit,
      rbacMatrix: settings.rbacMatrix
    } : null
  };
};

module.exports = {
  register,
  login,
};
