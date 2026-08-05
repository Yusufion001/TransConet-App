import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./vitest.setup.ts'],
    fileParallelism: false,
    pool: 'threads',
    minWorkers: 1,
    maxWorkers: 1,
    exclude: ['**/node_modules/**', '**/dist/**', 'e2e/**'],
  },
});
