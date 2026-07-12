// Fuel module routes
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { createFuelLogSchema } = require('./fuel.validator');
const controller = require('./fuel.controller');

router.get('/', auth, controller.listFuelLogs);
router.post('/', auth, validate(createFuelLogSchema), controller.createFuelLog);

module.exports = router;
