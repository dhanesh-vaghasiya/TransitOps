const express = require('express');
const {
  getAllDrivers,
  getDispatchPool,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
} = require('./driver.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/rbac.middleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Dispatch pool needs to be before /:id so it doesn't get matched as an ID
router.get('/dispatch-pool', getDispatchPool);

router.route('/')
  .get(getAllDrivers)
  .post(authorize('fleet_manager', 'safety_officer'), createDriver);

router.route('/:id')
  .get(getDriverById)
  .put(authorize('fleet_manager', 'safety_officer'), updateDriver)
  .delete(authorize('fleet_manager'), deleteDriver);

module.exports = router;
