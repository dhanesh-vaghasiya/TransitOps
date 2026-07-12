const generatePagination = (page, limit, total) => {
  return {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    total,
    totalPages: Math.ceil(total / limit),
  };
};

const calculateOperationalCost = (fuelCost, maintenanceCost, otherExpenseCost) => {
  const fuel = parseFloat(fuelCost) || 0;
  const maintenance = parseFloat(maintenanceCost) || 0;
  const other = parseFloat(otherExpenseCost) || 0;
  return parseFloat((fuel + maintenance + other).toFixed(2));
};

module.exports = {
  generatePagination,
  calculateOperationalCost,
};
