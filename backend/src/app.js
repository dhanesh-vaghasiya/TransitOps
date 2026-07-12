const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const env = require('./config/env');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./config/logger');
// Import routes here later

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS - allow all in dev, specific in prod
app.use(cors({ origin: env.NODE_ENV === 'development' ? '*' : env.CLIENT_URL }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Parse JSON request body
app.use(express.json());

// Parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// gzip compression
app.use(compression());

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'TransitOps API is healthy' });
});

// v1 api routes
app.use('/api/v1/auth', require('./modules/auth/auth.routes'));
app.use('/api/v1/vehicles', require('./modules/vehicle/routes'));
app.use('/api/v1/drivers', require('./modules/driver/routes'));
app.use('/api/v1/trips', require('./modules/trip/routes'));
app.use('/api/v1/maintenance', require('./modules/maintenance/routes'));
app.use('/api/v1/fuel', require('./modules/fuel/routes'));
app.use('/api/v1/fuel-logs', require('./modules/fuel/routes'));
app.use('/api/v1/expenses', require('./modules/expense/routes'));
app.use('/api/v1/reports', require('./modules/report/routes'));

// Error middleware should be mounted last
app.use(errorHandler);

module.exports = app;
