const express = require('express');
const router = express.Router();
const controller = require('./report.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { allRoles } = require('../../middleware/rbac.middleware');

router.get('/dashboard', authenticate, allRoles, controller.getDashboardKPIs);
router.get('/analytics', authenticate, allRoles, controller.getAnalytics);
router.get('/analytics/export.pdf', authenticate, allRoles, controller.exportPDF);

module.exports = router;
