const express = require('express');
const router = express.Router();
const controller = require('./report.controller');
const auth = require('../../middleware/auth');

router.get('/dashboard', auth, controller.getDashboardKPIs);

module.exports = router;
