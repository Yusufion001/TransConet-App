process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_12345';
process.env.ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'test_admin_jwt_secret_key_12345';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/test_db';

require('dotenv').config();
import { vi } from 'vitest';

vi.mock('ioredis', () => {
  const Redis = vi.fn(function() {
    return {
      on: vi.fn(),
      disconnect: vi.fn(),
    };
  });
  return { default: Redis, Redis };
});

vi.mock('bullmq', () => {
  const Queue = vi.fn(function() {
    return { add: vi.fn() };
  });
  const Worker = vi.fn(function() {
    return { on: vi.fn() };
  });
  return { Queue, Worker };
});
