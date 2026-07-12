const express = require('express');
const router = express.Router();
const settingsController = require('./settings.controller');
const auth = require('../../middleware/auth');
const { fleetManagerOnly } = require('../../middleware/rbac.middleware');

router.use(auth);

// All settings routes are restricted to Fleet Manager only
router.use(fleetManagerOnly);

router.get('/', settingsController.getSettings);
router.put('/', settingsController.updateSettings);
router.put('/rbac', settingsController.updateRbacMatrix);
router.get('/security-logs', settingsController.getSecurityLogs);

module.exports = router;
