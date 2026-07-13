const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const logger = require('./config/logger');
const prisma = require('./config/database');
const socketConfig = require('./config/socket');

// Load and validate environment variables
const env = require('./config/env');
const nodeEnv = env.NODE_ENV;
const clientUrl = env.CLIENT_URL;
const port = parseInt(env.PORT, 10);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: nodeEnv === 'development' ? '*' : clientUrl,
    methods: ['GET', 'POST'],
  },
});
app.set('io', io);

// Register io singleton so services can emit events
socketConfig.setIo(io);

io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

async function start() {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected successfully');
  } catch (err) {
    logger.error(`❌ Database connection failed: ${err.message}`);
    logger.error(`Make sure DATABASE_URL is set correctly in your environment variables.`);
    logger.error(`Current DATABASE_URL: ${env.DATABASE_URL ? '[SET]' : '[NOT SET]'}}`);
    process.exit(1);
  }

  server.listen(port, '0.0.0.0', () => {
    logger.info(`✅ Server listening on port ${port} in ${nodeEnv} mode`);
  });
}

start();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});
