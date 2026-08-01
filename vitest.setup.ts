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
