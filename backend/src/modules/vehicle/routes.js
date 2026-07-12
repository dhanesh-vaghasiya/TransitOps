const express = require('express');
const router = express.Router();
const vehicleController = require('./vehicle.controller');
const validate = require('../../middleware/validate');
const { createVehicleSchema, updateVehicleSchema } = require('./vehicle.validator');
const auth = require('../../middleware/auth');
const requireRole = require('../../middleware/rbac');

router.use(auth);

// Dispatch pool is accessible by dispatchers too
router.get('/dispatch-pool', vehicleController.getDispatchPool);

router.get('/:id/operational-cost', vehicleController.getOperationalCost);

router.get('/', vehicleController.getVehicles);
router.get('/:id', vehicleController.getVehicleById);

// Add auth constraints for modification
router.post(
  '/', 
  requireRole(['Fleet Manager', 'Admin']), 
  validate(createVehicleSchema), 
  vehicleController.createVehicle
);

router.put(
  '/:id', 
  requireRole(['Fleet Manager', 'Admin']), 
  validate(updateVehicleSchema), 
  vehicleController.updateVehicle
);

router.delete(
  '/:id', 
  requireRole(['Fleet Manager', 'Admin']), 
  vehicleController.deleteVehicle
);

module.exports = router;
