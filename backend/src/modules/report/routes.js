const express = require('express');
const router = express.Router();
const controller = require('./report.controller');
const auth = require('../../middleware/auth');

router.get('/dashboard', auth, controller.getDashboardKPIs);
router.get('/analytics', auth, controller.getAnalytics);
router.get('/analytics/export.pdf', auth, controller.exportPDF);

module.exports = router;
