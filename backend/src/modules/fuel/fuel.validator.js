const { z } = require('zod');

const createFuelLogSchema = z.object({
  vehicleId: z.number({ required_error: 'Vehicle is required' }).int().positive(),
  tripId: z.number().int().positive().nullable().optional(),
  liters: z.number({ required_error: 'Liters is required' }).positive('Liters must be positive'),
  costPerLiter: z.number({ required_error: 'Cost per liter is required' }).positive('Cost per liter must be positive'),
  totalCost: z.number().positive('Total cost must be positive').optional(),
  odometerReading: z.number({ required_error: 'Odometer reading is required' }).positive('Odometer reading must be positive'),
  receiptNumber: z.string().max(80).optional(),
});

module.exports = { createFuelLogSchema };
