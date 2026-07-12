const { z } = require('zod');

const vehicleTypeEnum = z.enum(['van', 'truck', 'lorry', 'bike', 'car', 'bus']);
const vehicleStatusEnum = z.enum(['available', 'on_trip', 'in_shop', 'retired']);

const createVehicleSchema = z.object({
  body: z.object({
    registrationNumber: z.string().min(1, 'Registration number is required').max(50),
    name: z.string().min(1, 'Name is required').max(255),
    model: z.string().max(255).optional(),
    type: vehicleTypeEnum,
    maxLoadCapacity: z.number().positive('Max load capacity must be positive'),
    odometer: z.number().nonnegative().optional(),
    acquisitionCost: z.number().nonnegative().optional(),
    status: vehicleStatusEnum.optional()
  })
});

const updateVehicleSchema = z.object({
  body: z.object({
    registrationNumber: z.string().min(1).max(50).optional(),
    name: z.string().min(1).max(255).optional(),
    model: z.string().max(255).optional(),
    type: vehicleTypeEnum.optional(),
    maxLoadCapacity: z.number().positive().optional(),
    odometer: z.number().nonnegative().optional(),
    acquisitionCost: z.number().nonnegative().optional(),
    status: vehicleStatusEnum.optional()
  })
});

module.exports = {
  createVehicleSchema,
  updateVehicleSchema
};
