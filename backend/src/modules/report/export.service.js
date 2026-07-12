const PDFDocument = require('pdfkit');

const generatePDF = (data, res) => {
  const doc = new PDFDocument({ margin: 50 });
  
  // Pipe the PDF into the response
  doc.pipe(res);

  // Title
  doc.fontSize(20).text('TransitOps Analytics Report', { align: 'center' });
  doc.moveDown();

  // KPIs
  doc.fontSize(14).text('Key Performance Indicators');
  doc.moveDown(0.5);
  doc.fontSize(12).text(`Fuel Efficiency: ${data.kpis.fuelEfficiency}`);
  doc.text(`Fleet Utilization: ${data.kpis.fleetUtilization}`);
  doc.text(`Operational Cost: ${data.kpis.operationalCost}`);
  doc.text(`Vehicle ROI: ${data.kpis.roi}`);
  doc.moveDown();

  // Monthly Revenue Table Header
  doc.fontSize(14).text('Monthly Revenue');
  doc.moveDown(0.5);
  doc.fontSize(10);
  
  const startX = 50;
  let startY = doc.y;

  doc.text('Month', startX, startY);
  doc.text('Actual (INR)', startX + 150, startY);
  doc.text('Projected (INR)', startX + 300, startY);
  doc.moveTo(startX, startY + 15).lineTo(startX + 450, startY + 15).stroke();
  
  startY += 20;

  data.charts.monthlyRevenue.forEach(row => {
    doc.text(row.month, startX, startY);
    doc.text(row.actual.toFixed(2), startX + 150, startY);
    doc.text(row.projected.toFixed(2), startX + 300, startY);
    startY += 15;
  });

  doc.moveDown(2);
  startY = doc.y;

  // Costliest Vehicles
  doc.fontSize(14).text('Top Costliest Vehicles', startX, startY);
  doc.moveDown(0.5);
  doc.fontSize(10);
  
  startY = doc.y;
  doc.text('Vehicle Registration', startX, startY);
  doc.text('Total Cost (INR)', startX + 200, startY);
  doc.moveTo(startX, startY + 15).lineTo(startX + 450, startY + 15).stroke();

  startY += 20;
  data.charts.costliestVehicles.forEach(row => {
    doc.text(row.name, startX, startY);
    doc.text(row.cost.toFixed(2), startX + 200, startY);
    startY += 15;
  });

  doc.end();
};

module.exports = {
  generatePDF
};
