// Vehicle module routes
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const controller = require('./vehicle.controller');

router.get('/', auth, controller.listVehicles);
router.get('/:id/operational-cost', auth, controller.getOperationalCost);

module.exports = router;
