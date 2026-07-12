const { z } = require('zod');

const createExpenseSchema = z.object({
  category: z.enum(['toll', 'parking', 'fine', 'insurance', 'other'], {
    required_error: 'Category is required',
  }),
  amount: z.number({ required_error: 'Amount is required' }).positive('Amount must be positive'),
  description: z.string().max(255).optional(),
  vehicleId: z.number({ required_error: 'Vehicle is required' }).int().positive(),
  tripId: z.number().int().positive().nullable().optional(),
});

module.exports = { createExpenseSchema };
