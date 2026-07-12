const reportService = require('./report.service');
const asyncHandler = require('../../middleware/asyncHandler');

const getDashboardKPIs = asyncHandler(async (req, res) => {
  const { type, status } = req.query;
  const data = await reportService.getDashboardKPIs({ type, status });
  res.json({ success: true, data });
});

module.exports = { getDashboardKPIs };
