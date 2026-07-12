const express = require('express');
const router = express.Router();
const maintenanceController = require('./maintenance.controller');
const auth = require('../../middleware/auth');
const requireRole = require('../../middleware/rbac');

router.use(auth);

router.route('/')
  .get(maintenanceController.getAllMaintenance)
  .post(requireRole(['fleet_manager', 'admin']), maintenanceController.createMaintenance);

router.route('/:id')
  .get(maintenanceController.getMaintenanceById)
  .put(requireRole(['fleet_manager', 'admin']), maintenanceController.updateMaintenance);

module.exports = router;
