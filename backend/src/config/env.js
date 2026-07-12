const { z } = require('zod');
require('dotenv').config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  DATABASE_URL: z.string().url(),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  process.exit(1);
}

module.exports = _env.data;
