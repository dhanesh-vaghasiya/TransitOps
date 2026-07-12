const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const env = require('./config/env');
const logger = require('./config/logger');

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: env.CLIENT_URL,
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

const PORT = env.PORT || 5000;

server.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT} in ${env.NODE_ENV} mode`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});
