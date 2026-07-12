const { z } = require('zod');

const updateSettingsSchema = z.object({
  body: z.object({
    depotName: z.string().min(1, 'Depot Name is required').max(255),
    currency: z.string().min(1, 'Currency is required').max(10),
    distanceUnit: z.string().min(1, 'Distance Unit is required').max(10),
  }),
});

const updateRbacSchema = z.object({
  body: z.object({
    rbacMatrix: z.record(
      z.string(),
      z.record(z.string(), z.enum(['full', 'view', 'none']))
    ),
  }),
});

module.exports = {
  updateSettingsSchema,
  updateRbacSchema,
};
