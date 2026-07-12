const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const logger = require('./config/logger');
const prisma = require('./config/database');
const socketConfig = require('./config/socket');
const nodeEnv = process.env.NODE_ENV || 'development';
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const port = process.env.PORT || 5000;

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
    logger.info('Database connected successfully');
  } catch (err) {
    logger.error(`Database connection failed: ${err.message}`);
    process.exit(1);
  }

  server.listen(port, () => {
    logger.info(`Server listening on port ${port} in ${nodeEnv} mode`);
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
