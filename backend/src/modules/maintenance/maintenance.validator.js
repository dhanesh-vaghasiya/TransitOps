const { z } = require('zod');

const createMaintenanceSchema = z.object({
  body: z.object({
    workOrderNumber: z.string().min(1, 'Work order number is required'),
    vehicleId: z.number().int().positive('Valid vehicle ID is required'),
    maintenanceType: z.enum(['oil_change', 'tire_replacement', 'engine_repair', 'brake_service', 'general_inspection', 'other']),
    description: z.string().optional(),
    cost: z.number().nonnegative('Cost must be positive'),
    status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).default('scheduled'),
  })
});

const updateMaintenanceSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be numeric').transform(Number)
  }),
  body: z.object({
    status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).optional(),
    cost: z.number().nonnegative('Cost must be positive').optional(),
    description: z.string().optional(),
  })
});

const getMaintenanceSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be numeric').transform(Number)
  })
});

module.exports = {
  createMaintenanceSchema,
  updateMaintenanceSchema,
  getMaintenanceSchema,
};
