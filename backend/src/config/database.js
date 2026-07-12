const { PrismaClient } = require('@prisma/client');
const logger = require('./logger');

class Database {
  constructor() {
    if (!Database.instance) {
      this.prisma = new PrismaClient({
        log: [
          { emit: 'event', level: 'query' },
          { emit: 'event', level: 'error' },
          { emit: 'event', level: 'info' },
          { emit: 'event', level: 'warn' },
        ],
      });

      this.prisma.$on('error', (e) => {
        logger.error(`Prisma Error: ${e.message}`);
      });

      this.prisma.$on('warn', (e) => {
        logger.warn(`Prisma Warn: ${e.message}`);
      });

      Database.instance = this;
    }
    return Database.instance;
  }
}

const db = new Database();
module.exports = db.prisma;
