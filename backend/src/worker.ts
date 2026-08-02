import dotenv from 'dotenv';
import path from 'path';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(process.cwd(), '.env');
const envPath2 = path.resolve(process.cwd(), '../.env');
dotenv.config({ path: envPath, override: true });
dotenv.config({ path: envPath2, override: true });

import winston from 'winston';
import { startEmbeddingRetryWorker } from './workers/embeddingRetryWorker';
import { startWorkers } from './services/queueService';
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console()
  ],
});
logger.info('🚀 Background Worker Process Started');
// Start BullMQ and Outbox workers
startWorkers();
// Start retry sweeps
startEmbeddingRetryWorker();
// Ensure process stays alive
setInterval(() => {
  logger.debug('Worker heartbeat');
}, 60000);
