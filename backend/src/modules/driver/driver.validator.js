const { z } = require('zod');

const createDriverSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    licenseNumber: z.string().min(1, 'License number is required'),
    licenseCategory: z.enum(['A', 'B', 'C', 'D', 'E', 'F']),
    licenseExpiry: z.string().transform((str) => new Date(str)),
    contactNumber: z.string().optional(),
    safetyScore: z.coerce.number().min(0).max(100).optional(),
    status: z.enum(['available', 'on_trip', 'off_duty', 'suspended']).optional(),
  }),
});

const updateDriverSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    licenseNumber: z.string().min(1).optional(),
    licenseCategory: z.enum(['A', 'B', 'C', 'D', 'E', 'F']).optional(),
    licenseExpiry: z.string().transform((str) => new Date(str)).optional(),
    contactNumber: z.string().optional(),
    safetyScore: z.coerce.number().min(0).max(100).optional(),
    status: z.enum(['available', 'on_trip', 'off_duty', 'suspended']).optional(),
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be numeric').transform(Number),
  }),
});

const getDriverSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be numeric').transform(Number),
  }),
});

module.exports = {
  createDriverSchema,
  updateDriverSchema,
  getDriverSchema,
};
