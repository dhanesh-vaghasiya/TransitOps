# Document 3 — Backend Design
## TransitOps: Smart Transport Operations Platform

---

## 1. Express Folder Structure

```
apps/api/src/
├── 📁 config/
│   ├── database.js          # Prisma client singleton
│   ├── env.js               # Environment validation (zod)
│   └── logger.js            # Winston logger setup
│
├── 📁 middleware/
│   ├── auth.middleware.js   # JWT verification
│   ├── rbac.middleware.js   # Role-based access control
│   ├── validate.middleware.js # Zod schema validation
│   ├── error.middleware.js  # Global error handler
│   └── asyncHandler.js      # Wrap async controllers
│
├── 📁 modules/
│   ├── 📁 auth/
│   │   ├── auth.controller.js
│   │   ├── auth.service.js
│   │   ├── auth.routes.js
│   │   ├── auth.validator.js
│   │   └── auth.test.js
│   │
│   ├── 📁 vehicle/
│   │   ├── vehicle.controller.js
│   │   ├── vehicle.service.js
│   │   ├── vehicle.routes.js
│   │   ├── vehicle.validator.js
│   │   └── vehicle.test.js
│   │
│   ├── 📁 driver/
│   │   ├── driver.controller.js
│   │   ├── driver.service.js
│   │   ├── driver.routes.js
│   │   ├── driver.validator.js
│   │   └── driver.test.js
│   │
│   ├── 📁 trip/
│   │   ├── trip.controller.js
│   │   ├── trip.service.js
│   │   ├── trip.routes.js
│   │   ├── trip.validator.js
│   │   └── trip.test.js
│   │
│   ├── 📁 maintenance/
│   │   ├── maintenance.controller.js
│   │   ├── maintenance.service.js
│   │   ├── maintenance.routes.js
│   │   ├── maintenance.validator.js
│   │   └── maintenance.test.js
│   │
│   ├── 📁 fuel/
│   │   ├── fuel.controller.js
│   │   ├── fuel.service.js
│   │   ├── fuel.routes.js
│   │   ├── fuel.validator.js
│   │   └── fuel.test.js
│   │
│   ├── 📁 expense/
│   │   ├── expense.controller.js
│   │   ├── expense.service.js
│   │   ├── expense.routes.js
│   │   ├── expense.validator.js
│   │   └── expense.test.js
│   │
│   └── 📁 report/
│       ├── report.controller.js
│       ├── report.service.js
│       ├── report.routes.js
│       └── report.test.js
│
├── 📁 utils/
│   ├── ApiError.js          # Custom error class
│   ├── response.js          # Standardized response formatter
│   ├── constants.js         # App constants
│   └── helpers.js           # Math helpers (ROI, efficiency)
│
├── 📁 prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── app.js                   # Express app configuration
└── server.js                # Server bootstrap + Socket.io
```

---

## 2. Global Middleware Stack (`app.js`)

```javascript
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const { errorMiddleware } = require('./middleware/error.middleware');

const app = express();

// Security
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(compression());

// Parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Routes (mounted in server.js or here)
// ...

// Global error handler (MUST be last)
app.use(errorMiddleware);

module.exports = app;
```

---

## 3. Authentication & RBAC

### 3.1 JWT Auth Middleware (`auth.middleware.js`)

```javascript
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const ApiError = require('../utils/ApiError');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) throw new ApiError(401, 'Authentication required');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { roles: { include: { role: true } } }
    });

    if (!user || user.status !== 'active') {
      throw new ApiError(401, 'User not found or inactive');
    }

    req.user = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      roles: user.roles.map(ur => ur.role.name)
    };

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { authenticate };
```

### 3.2 RBAC Middleware (`rbac.middleware.js`)

```javascript
const ApiError = require('../utils/ApiError');

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) throw new ApiError(401, 'Not authenticated');

    const hasRole = req.user.roles.some(role => allowedRoles.includes(role));
    if (!hasRole) {
      throw new ApiError(403, `Access denied. Required roles: ${allowedRoles.join(', ')}`);
    }
    next();
  };
};

// Convenience wrappers
const fleetManagerOnly = authorize('fleet_manager');
const driverAndAbove = authorize('fleet_manager', 'driver');
const safetyAndAbove = authorize('fleet_manager', 'safety_officer');
const financeAndAbove = authorize('fleet_manager', 'financial_analyst');
const allRoles = authorize('fleet_manager', 'driver', 'safety_officer', 'financial_analyst');

module.exports = { authorize, fleetManagerOnly, driverAndAbove, safetyAndAbove, financeAndAbove, allRoles };
```

### 3.3 Auth Routes (`auth.routes.js`)

```javascript
const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const authValidator = require('./auth.validator');
const { validate } = require('../middleware/validate.middleware');

router.post('/register', validate(authValidator.registerSchema), authController.register);
router.post('/login', validate(authValidator.loginSchema), authController.login);
router.get('/me', authenticate, authController.getMe);

module.exports = router;
```

### 3.4 Auth Controller (`auth.controller.js`)

```javascript
const authService = require('./auth.service');
const asyncHandler = require('../middleware/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);
  res.status(201).json({ success: true, data: user });
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.json({ success: true, data: result });
});

const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});

module.exports = { register, login, getMe };
```

### 3.5 Auth Service (`auth.service.js`)

```javascript
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const ApiError = require('../utils/ApiError');

const SALT_ROUNDS = 12;
const JWT_EXPIRES = '8h'; // Hackathon: long session

const register = async ({ email, password, fullName, roleNames = ['driver'] }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ApiError(409, 'Email already registered');

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const roles = await prisma.role.findMany({ where: { name: { in: roleNames } } });

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName,
      roles: { create: roles.map(r => ({ roleId: r.id })) }
    },
    include: { roles: { include: { role: true } } }
  });

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    roles: user.roles.map(ur => ur.role.name)
  };
};

const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { roles: { include: { role: true } } }
  });

  if (!user) throw new ApiError(401, 'Invalid credentials');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new ApiError(401, 'Invalid credentials');

  if (user.status !== 'active') throw new ApiError(403, 'Account inactive');

  const token = jwt.sign(
    { userId: user.id, roles: user.roles.map(ur => ur.role.name) },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      roles: user.roles.map(ur => ur.role.name)
    }
  };
};

module.exports = { register, login };
```

### 3.6 Auth Validator (`auth.validator.js`)

```javascript
const { z } = require('zod');

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Name required'),
  roleNames: z.array(z.string()).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password required')
});

module.exports = { registerSchema, loginSchema };
```

---

## 4. Complete REST API Specification

### Base URL: `/api/v1`

---

### 4.1 AUTH MODULE

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/auth/register` | No | Any | Register new user |
| POST | `/auth/login` | No | Any | Login, returns JWT |
| GET | `/auth/me` | Yes | Any | Get current user |

---

### 4.2 VEHICLE MODULE

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/vehicles` | Yes | All | List all vehicles (with filters) |
| GET | `/vehicles/:id` | Yes | All | Get vehicle by ID |
| POST | `/vehicles` | Yes | Fleet Manager | Create vehicle |
| PUT | `/vehicles/:id` | Yes | Fleet Manager | Update vehicle |
| DELETE | `/vehicles/:id` | Yes | Fleet Manager | Soft delete / retire vehicle |
| GET | `/vehicles/available` | Yes | Driver+ | List available for dispatch |
| GET | `/vehicles/:id/trips` | Yes | All | Trip history for vehicle |
| GET | `/vehicles/:id/maintenance` | Yes | All | Maintenance history |

**Vehicle Controller:**
```javascript
const vehicleService = require('./vehicle.service');
const asyncHandler = require('../middleware/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const { status, type, search } = req.query;
  const vehicles = await vehicleService.list({ status, type, search });
  res.json({ success: true, data: vehicles });
});

const getById = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.getById(Number(req.params.id));
  res.json({ success: true, data: vehicle });
});

const create = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.create(req.body);
  res.status(201).json({ success: true, data: vehicle });
});

const update = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.update(Number(req.params.id), req.body);
  res.json({ success: true, data: vehicle });
});

const remove = asyncHandler(async (req, res) => {
  await vehicleService.retire(Number(req.params.id));
  res.json({ success: true, message: 'Vehicle retired' });
});

const getAvailable = asyncHandler(async (req, res) => {
  const vehicles = await vehicleService.getAvailableForDispatch();
  res.json({ success: true, data: vehicles });
});

module.exports = { list, getById, create, update, remove, getAvailable };
```

**Vehicle Service (Business Logic):**
```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const ApiError = require('../utils/ApiError');

const list = async ({ status, type, search }) => {
  const where = {};
  if (status) where.status = status;
  if (type) where.type = type;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { registrationNumber: { contains: search, mode: 'insensitive' } }
    ];
  }
  return prisma.vehicle.findMany({ where, orderBy: { createdAt: 'desc' } });
};

const getById = async (id) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: { trips: { orderBy: { createdAt: 'desc' }, take: 10 } }
  });
  if (!vehicle) throw new ApiError(404, 'Vehicle not found');
  return vehicle;
};

const create = async (data) => {
  // Business rule: Unique registration enforced by DB, but check for better error
  const existing = await prisma.vehicle.findUnique({
    where: { registrationNumber: data.registrationNumber }
  });
  if (existing) throw new ApiError(409, 'Registration number already exists');

  return prisma.vehicle.create({ data });
};

const update = async (id, data) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) throw new ApiError(404, 'Vehicle not found');

  if (data.registrationNumber && data.registrationNumber !== vehicle.registrationNumber) {
    const existing = await prisma.vehicle.findUnique({
      where: { registrationNumber: data.registrationNumber }
    });
    if (existing) throw new ApiError(409, 'Registration number already exists');
  }

  return prisma.vehicle.update({ where: { id }, data });
};

const retire = async (id) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) throw new ApiError(404, 'Vehicle not found');
  if (vehicle.status === 'on_trip') throw new ApiError(400, 'Cannot retire vehicle on active trip');

  return prisma.vehicle.update({
    where: { id },
    data: { status: 'retired' }
  });
};

const getAvailableForDispatch = async () => {
  return prisma.vehicle.findMany({
    where: { status: 'available' },
    orderBy: { name: 'asc' }
  });
};

module.exports = { list, getById, create, update, retire, getAvailableForDispatch };
```

**Vehicle Validator:**
```javascript
const { z } = require('zod');

const vehicleTypeEnum = z.enum(['van', 'truck', 'lorry', 'bike', 'car', 'bus']);
const vehicleStatusEnum = z.enum(['available', 'on_trip', 'in_shop', 'retired']);

const createSchema = z.object({
  registrationNumber: z.string().min(1).max(50),
  name: z.string().min(1).max(255),
  model: z.string().max(255).optional(),
  type: vehicleTypeEnum,
  maxLoadCapacity: z.number().positive(),
  odometer: z.number().min(0).optional(),
  acquisitionCost: z.number().min(0).optional()
});

const updateSchema = createSchema.partial();

module.exports = { createSchema, updateSchema };
```

**Vehicle Routes:**
```javascript
const express = require('express');
const router = express.Router();
const controller = require('./vehicle.controller');
const validator = require('./vehicle.validator');
const { authenticate } = require('../../middleware/auth.middleware');
const { fleetManagerOnly, allRoles } = require('../../middleware/rbac.middleware');
const { validate } = require('../../middleware/validate.middleware');

router.get('/', authenticate, allRoles, controller.list);
router.get('/available', authenticate, allRoles, controller.getAvailable);
router.get('/:id', authenticate, allRoles, controller.getById);
router.post('/', authenticate, fleetManagerOnly, validate(validator.createSchema), controller.create);
router.put('/:id', authenticate, fleetManagerOnly, validate(validator.updateSchema), controller.update);
router.delete('/:id', authenticate, fleetManagerOnly, controller.remove);

module.exports = router;
```

---

### 4.3 DRIVER MODULE

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/drivers` | Yes | All | List drivers |
| GET | `/drivers/:id` | Yes | All | Get driver by ID |
| POST | `/drivers` | Yes | Fleet/Safety | Create driver |
| PUT | `/drivers/:id` | Yes | Fleet/Safety | Update driver |
| DELETE | `/drivers/:id` | Yes | Fleet Manager | Delete driver |
| GET | `/drivers/available` | Yes | Driver+ | Available for dispatch |
| GET | `/drivers/expiring` | Yes | Safety+ | Licenses expiring within 30 days |

**Driver Service (Key Business Logic):**
```javascript
const getAvailableForDispatch = async () => {
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  return prisma.driver.findMany({
    where: {
      status: 'available',
      licenseExpiry: { gt: thirtyDaysFromNow }, // Must be valid for >30 days
      NOT: { status: 'suspended' }
    },
    orderBy: { name: 'asc' }
  });
};

const getExpiringLicenses = async (days = 30) => {
  const future = new Date();
  future.setDate(future.getDate() + days);

  return prisma.driver.findMany({
    where: {
      licenseExpiry: { lte: future, gte: new Date() }
    },
    orderBy: { licenseExpiry: 'asc' }
  });
};
```

---

### 4.4 TRIP MODULE (Most Critical)

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/trips` | Yes | All | List trips (with filters) |
| GET | `/trips/:id` | Yes | All | Get trip details |
| POST | `/trips` | Yes | Driver+ | Create trip (draft) |
| PUT | `/trips/:id/dispatch` | Yes | Driver+ | Dispatch trip |
| PUT | `/trips/:id/complete` | Yes | Driver+ | Complete trip |
| PUT | `/trips/:id/cancel` | Yes | Driver+ | Cancel trip |
| PUT | `/trips/:id` | Yes | Driver+ | Update draft trip |
| DELETE | `/trips/:id` | Yes | Driver+ | Delete draft trip |

**Trip Service (Status Transitions & Business Rules):**
```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const ApiError = require('../utils/ApiError');

const create = async (data) => {
  // Rule: Vehicle must exist and be available
  const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
  if (!vehicle) throw new ApiError(404, 'Vehicle not found');
  if (vehicle.status !== 'available') throw new ApiError(400, 'Vehicle is not available');
  if (vehicle.status === 'retired' || vehicle.status === 'in_shop') {
    throw new ApiError(400, 'Vehicle cannot be assigned (retired or in maintenance)');
  }

  // Rule: Driver must exist, be available, not suspended, license valid
  const driver = await prisma.driver.findUnique({ where: { id: data.driverId } });
  if (!driver) throw new ApiError(404, 'Driver not found');
  if (driver.status !== 'available') throw new ApiError(400, 'Driver is not available');
  if (driver.status === 'suspended') throw new ApiError(400, 'Driver is suspended');
  if (driver.licenseExpiry < new Date()) throw new ApiError(400, 'Driver license has expired');

  // Rule: Cargo weight must not exceed vehicle capacity
  if (data.cargoWeight > vehicle.maxLoadCapacity) {
    throw new ApiError(400, `Cargo weight (${data.cargoWeight}kg) exceeds vehicle capacity (${vehicle.maxLoadCapacity}kg)`);
  }

  return prisma.trip.create({
    data: {
      ...data,
      status: 'draft'
    },
    include: { vehicle: true, driver: true }
  });
};

const dispatch = async (tripId, userId) => {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { vehicle: true, driver: true }
  });

  if (!trip) throw new ApiError(404, 'Trip not found');
  if (trip.status !== 'draft') throw new ApiError(400, 'Only draft trips can be dispatched');

  // Re-validate before dispatch (state might have changed)
  if (trip.vehicle.status !== 'available') throw new ApiError(400, 'Vehicle is no longer available');
  if (trip.driver.status !== 'available') throw new ApiError(400, 'Driver is no longer available');
  if (trip.driver.licenseExpiry < new Date()) throw new ApiError(400, 'Driver license expired');

  // Update trip status (triggers handle vehicle/driver status via DB triggers)
  // OR handle in application layer for more control:
  const [updatedTrip] = await prisma.$transaction([
    prisma.trip.update({
      where: { id: tripId },
      data: { status: 'dispatched', startedAt: new Date() },
      include: { vehicle: true, driver: true }
    }),
    prisma.vehicle.update({
      where: { id: trip.vehicleId },
      data: { status: 'on_trip' }
    }),
    prisma.driver.update({
      where: { id: trip.driverId },
      data: { status: 'on_trip' }
    })
  ]);

  return updatedTrip;
};

const complete = async (tripId, { actualDistance, fuelConsumed, finalOdometer }) => {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) throw new ApiError(404, 'Trip not found');
  if (trip.status !== 'dispatched') throw new ApiError(400, 'Only dispatched trips can be completed');

  const [updatedTrip] = await prisma.$transaction([
    prisma.trip.update({
      where: { id: tripId },
      data: {
        status: 'completed',
        actualDistance,
        fuelConsumed,
        completedAt: new Date()
      },
      include: { vehicle: true, driver: true }
    }),
    prisma.vehicle.update({
      where: { id: trip.vehicleId },
      data: { status: 'available', odometer: finalOdometer }
    }),
    prisma.driver.update({
      where: { id: trip.driverId },
      data: { status: 'available' }
    })
  ]);

  return updatedTrip;
};

const cancel = async (tripId) => {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) throw new ApiError(404, 'Trip not found');
  if (trip.status !== 'dispatched' && trip.status !== 'draft') {
    throw new ApiError(400, 'Only draft or dispatched trips can be cancelled');
  }

  const updates = [prisma.trip.update({
    where: { id: tripId },
    data: { status: 'cancelled' },
    include: { vehicle: true, driver: true }
  })];

  // Only restore if was dispatched
  if (trip.status === 'dispatched') {
    updates.push(
      prisma.vehicle.update({ where: { id: trip.vehicleId }, data: { status: 'available' } }),
      prisma.driver.update({ where: { id: trip.driverId }, data: { status: 'available' } })
    );
  }

  const [updatedTrip] = await prisma.$transaction(updates);
  return updatedTrip;
};

module.exports = { create, dispatch, complete, cancel };
```

**Trip Validator:**
```javascript
const { z } = require('zod');

const createSchema = z.object({
  vehicleId: z.number().int().positive(),
  driverId: z.number().int().positive(),
  source: z.string().min(1).max(255),
  destination: z.string().min(1).max(255),
  cargoWeight: z.number().positive(),
  plannedDistance: z.number().positive()
});

const completeSchema = z.object({
  actualDistance: z.number().positive(),
  fuelConsumed: z.number().positive(),
  finalOdometer: z.number().positive()
});

module.exports = { createSchema, completeSchema };
```

---

### 4.5 MAINTENANCE MODULE

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/maintenance` | Yes | All | List maintenance logs |
| GET | `/maintenance/:id` | Yes | All | Get maintenance record |
| POST | `/maintenance` | Yes | Fleet Manager | Create maintenance record |
| PUT | `/maintenance/:id/start` | Yes | Fleet Manager | Start maintenance (vehicle → in_shop) |
| PUT | `/maintenance/:id/complete` | Yes | Fleet Manager | Complete maintenance |
| PUT | `/maintenance/:id/cancel` | Yes | Fleet Manager | Cancel maintenance |

**Maintenance Service:**
```javascript
const create = async (data) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
  if (!vehicle) throw new ApiError(404, 'Vehicle not found');
  if (vehicle.status === 'on_trip') throw new ApiError(400, 'Cannot schedule maintenance for vehicle on trip');
  if (vehicle.status === 'retired') throw new ApiError(400, 'Vehicle is retired');

  return prisma.maintenanceLog.create({
    data: { ...data, status: 'scheduled' },
    include: { vehicle: true }
  });
};

const start = async (id) => {
  const log = await prisma.maintenanceLog.findUnique({
    where: { id },
    include: { vehicle: true }
  });
  if (!log) throw new ApiError(404, 'Maintenance record not found');
  if (log.status !== 'scheduled') throw new ApiError(400, 'Only scheduled maintenance can be started');
  if (log.vehicle.status === 'on_trip') throw new ApiError(400, 'Vehicle is currently on trip');

  const [updated] = await prisma.$transaction([
    prisma.maintenanceLog.update({
      where: { id },
      data: { status: 'in_progress', startedAt: new() },
      include: { vehicle: true }
    }),
    prisma.vehicle.update({
      where: { id: log.vehicleId },
      data: { status: 'in_shop' }
    })
  ]);

  return updated;
};

const complete = async (id) => {
  const log = await prisma.maintenanceLog.findUnique({ where: { id } });
  if (!log) throw new ApiError(404, 'Maintenance record not found');
  if (log.status !== 'in_progress') throw new ApiError(400, 'Only in-progress maintenance can be completed');

  const [updated] = await prisma.$transaction([
    prisma.maintenanceLog.update({
      where: { id },
      data: { status: 'completed', completedAt: new Date() },
      include: { vehicle: true }
    }),
    prisma.vehicle.update({
      where: { id: log.vehicleId },
      data: { status: 'available' }
    })
  ]);

  return updated;
};
```

---

### 4.6 FUEL MODULE

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/fuel` | Yes | All | List fuel logs |
| GET | `/fuel/vehicle/:vehicleId` | Yes | All | Fuel logs per vehicle |
| POST | `/fuel` | Yes | Driver+ | Log fuel entry |
| DELETE | `/fuel/:id` | Yes | Fleet Manager | Delete fuel log |

**Fuel Service:**
```javascript
const create = async (data) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
  if (!vehicle) throw new ApiError(404, 'Vehicle not found');
  if (data.odometerReading < vehicle.odometer) {
    throw new ApiError(400, 'Odometer reading cannot be less than current vehicle odometer');
  }

  const totalCost = data.liters * data.costPerLiter;

  const [fuelLog] = await prisma.$transaction([
    prisma.fuelLog.create({
      data: { ...data, totalCost },
      include: { vehicle: true, trip: true }
    }),
    prisma.vehicle.update({
      where: { id: data.vehicleId },
      data: { odometer: data.odometerReading }
    })
  ]);

  return fuelLog;
};
```

---

### 4.7 EXPENSE MODULE

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/expenses` | Yes | All | List expenses |
| GET | `/expenses/vehicle/:vehicleId` | Yes | All | Expenses per vehicle |
| POST | `/expenses` | Yes | Driver+ | Log expense |
| DELETE | `/expenses/:id` | Yes | Fleet Manager | Delete expense |

---

### 4.8 REPORT MODULE

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/reports/dashboard` | Yes | All | KPI snapshot |
| GET | `/reports/fuel-efficiency` | Yes | All | Per vehicle efficiency |
| GET | `/reports/operational-cost` | Yes | Finance+ | Cost breakdown |
| GET | `/reports/vehicle-roi` | Yes | Finance+ | ROI calculation |
| GET | `/reports/fleet-utilization` | Yes | All | Utilization % |
| GET | `/reports/export/csv` | Yes | All | CSV export |

**Report Service:**
```javascript
const getDashboardKPIs = async () => {
  const [
    totalVehicles,
    availableVehicles,
    activeVehicles,
    maintenanceVehicles,
    totalDrivers,
    driversOnDuty,
    activeTrips,
    pendingTrips,
    completedTripsToday
  ] = await Promise.all([
    prisma.vehicle.count(),
    prisma.vehicle.count({ where: { status: 'available' } }),
    prisma.vehicle.count({ where: { status: 'on_trip' } }),
    prisma.vehicle.count({ where: { status: 'in_shop' } }),
    prisma.driver.count(),
    prisma.driver.count({ where: { status: 'on_trip' } }),
    prisma.trip.count({ where: { status: 'dispatched' } }),
    prisma.trip.count({ where: { status: 'draft' } }),
    prisma.trip.count({
      where: {
        status: 'completed',
        completedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      }
    })
  ]);

  const utilization = totalVehicles > 0
    ? ((activeVehicles / totalVehicles) * 100).toFixed(2)
    : 0;

  return {
    totalVehicles,
    availableVehicles,
    activeVehicles,
    maintenanceVehicles,
    totalDrivers,
    driversOnDuty,
    activeTrips,
    pendingTrips,
    completedTripsToday,
    fleetUtilization: `${utilization}%`
  };
};

const getFuelEfficiency = async (vehicleId) => {
  const trips = await prisma.trip.findMany({
    where: { vehicleId, status: 'completed', fuelConsumed: { not: null }, actualDistance: { not: null } },
    select: { actualDistance: true, fuelConsumed: true }
  });

  const totalDistance = trips.reduce((sum, t) => sum + Number(t.actualDistance), 0);
  const totalFuel = trips.reduce((sum, t) => sum + Number(t.fuelConsumed), 0);

  return {
    vehicleId,
    totalDistance,
    totalFuel,
    efficiency: totalFuel > 0 ? (totalDistance / totalFuel).toFixed(2) : 0
  };
};

const getVehicleROI = async (vehicleId) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) throw new ApiError(404, 'Vehicle not found');

  const fuelCosts = await prisma.fuelLog.aggregate({
    where: { vehicleId },
    _sum: { totalCost: true }
  });

  const maintenanceCosts = await prisma.maintenanceLog.aggregate({
    where: { vehicleId, status: 'completed' },
    _sum: { cost: true }
  });

  const revenue = Number(vehicle.acquisitionCost) * 1.5; // Simulated revenue
  const totalCost = Number(fuelCosts._sum.totalCost || 0) + Number(maintenanceCosts._sum.cost || 0);
  const roi = vehicle.acquisitionCost > 0
    ? ((revenue - totalCost) / Number(vehicle.acquisitionCost) * 100).toFixed(2)
    : 0;

  return {
    vehicleId,
    acquisitionCost: vehicle.acquisitionCost,
    revenue,
    fuelCost: fuelCosts._sum.totalCost || 0,
    maintenanceCost: maintenanceCosts._sum.cost || 0,
    totalCost,
    roi: `${roi}%`
  };
};
```

---

## 5. Validation Middleware (`validate.middleware.js`)

```javascript
const ApiError = require('../utils/ApiError');

const validate = (schema) => {
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req.body);
      if (!result.success) {
        const errors = result.error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }));
        throw new ApiError(400, 'Validation failed', errors);
      }
      req.body = result.data; // Sanitized data
      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = { validate };
```

---

## 6. Error Handling Architecture

### 6.1 Custom Error Class (`ApiError.js`)

```javascript
class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
```

### 6.2 Global Error Middleware (`error.middleware.js`)

```javascript
const logger = require('../config/logger');

const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  // Prisma error handling
  if (err.code === 'P2002') {
    statusCode = 409;
    message = 'Unique constraint violation';
    errors = [{ field: err.meta?.target?.[0], message: 'Already exists' }];
  }
  if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found';
  }
  if (err.code === 'P2003') {
    statusCode = 400;
    message = 'Foreign key constraint failed';
  }

  // Log error
  logger.error({
    statusCode,
    message,
    errors,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  res.status(statusCode).json({
    success: false,
    message,
    errors: process.env.NODE_ENV === 'development' ? errors : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = { errorMiddleware };
```

---

## 7. Async Handler Wrapper (`asyncHandler.js`)

```javascript
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
```

---

## 8. Real-Time Module (Socket.io)

```javascript
// server.js
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.CLIENT_URL } });

// Socket authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication required'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log(`User ${socket.userId} connected`);
  socket.join('fleet_updates');

  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected`);
  });
});

// Export io for use in services
app.set('io', io);

// Helper to emit events
const emitFleetUpdate = (event, data) => {
  io.to('fleet_updates').emit(event, data);
};

module.exports = { server, emitFleetUpdate };
```

**Usage in Services:**
```javascript
const { emitFleetUpdate } = require('../../server');

// After dispatching a trip:
emitFleetUpdate('trip:dispatched', { tripId: updatedTrip.id, vehicleId, driverId });
emitFleetUpdate('vehicle:status_changed', { vehicleId, status: 'on_trip' });
emitFleetUpdate('driver:status_changed', { driverId, status: 'on_trip' });
emitFleetUpdate('dashboard:update', await reportService.getDashboardKPIs());
```

---

## 9. API Response Standardization

```javascript
// utils/response.js
const success = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

const paginated = (res, data, pagination) => {
  res.json({
    success: true,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.limit)
    }
  });
};

module.exports = { success, paginated };
```

---

## 10. Security Checklist

| Layer | Implementation |
|-------|---------------|
| **Authentication** | JWT with 8h expiry, bcrypt hashing (12 rounds) |
| **Authorization** | RBAC middleware on every route |
| **Input Validation** | Zod schemas on all POST/PUT bodies |
| **SQL Injection** | Prisma ORM (parameterized queries) |
| **XSS Protection** | Helmet.js headers |
| **Rate Limiting** | 100 requests per 15 minutes per IP |
| **CORS** | Whitelist client URL only |
| **Sensitive Data** | Passwords never returned in responses |
| **Error Leakage** | Stack traces only in development |
| **Transactions** | Prisma $transaction for multi-table operations |
