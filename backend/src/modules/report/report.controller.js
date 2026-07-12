const reportService = require('./report.service');
const exportService = require('./export.service');
const asyncHandler = require('../../middleware/asyncHandler');

const getDashboardKPIs = asyncHandler(async (req, res) => {
  const { type, status } = req.query;
  const data = await reportService.getDashboardKPIs({ type, status });
  res.json({ success: true, data });
});

const getAnalytics = asyncHandler(async (req, res) => {
  const data = await reportService.getAnalyticsReport();
  res.json({ success: true, data });
});

const exportPDF = asyncHandler(async (req, res) => {
  const data = await reportService.getAnalyticsReport();
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="transitops-analytics.pdf"');
  
  exportService.generatePDF(data, res);
});

module.exports = { getDashboardKPIs, getAnalytics, exportPDF };
