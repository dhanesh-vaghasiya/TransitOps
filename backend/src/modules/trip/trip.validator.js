const { z } = require('zod');

const createTripSchema = z.object({
  vehicleId: z.number({ required_error: 'Vehicle is required' }).int().positive(),
  driverId: z.number({ required_error: 'Driver is required' }).int().positive(),
  source: z.string().min(1, 'Source is required').max(255),
  destination: z.string().min(1, 'Destination is required').max(255),
  cargoWeight: z
    .number({ required_error: 'Cargo weight is required' })
    .positive('Cargo weight must be positive'),
  plannedDistance: z
    .number({ required_error: 'Planned distance is required' })
    .positive('Planned distance must be positive'),
});

const completeTripSchema = z.object({
  finalOdometer: z
    .number({ required_error: 'Final odometer reading is required' })
    .positive('Odometer reading must be positive'),
  fuelConsumed: z
    .number({ required_error: 'Fuel consumed is required' })
    .positive('Fuel consumed must be positive'),
  fuelCostPerLiter: z
    .number({ required_error: 'Fuel cost per liter is required' })
    .positive('Fuel cost per liter must be positive'),
});

module.exports = { createTripSchema, completeTripSchema };
