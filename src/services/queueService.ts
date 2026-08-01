import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { sendSMS } from './smsService';
import { sendEmailAlert } from './emailService';
import { prismaRLS, prisma as standardPrisma } from '../db/prisma';
import { GoogleGenAI } from '@google/genai';

const isProduction = process.env.NODE_ENV === 'production';
const hasRedis = !!process.env.REDIS_URL;

// We use lazyConnect: true to prevent crashing if Redis is down
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const connection = process.env.REDIS_URL ? new Redis(redisUrl, { 
  maxRetriesPerRequest: null,
  lazyConnect: true,
  retryStrategy: (times) => {
    if (!hasRedis && times > 3) {
      return null; // Stop retrying if we didn't explicitly configure Redis
    }
    // Exponential backoff for Redis connection
    return Math.min(times * 100, 3000);
  }
}) : null;

let redisIsAvailable = false;

// Avoid unhandled errors crashing the app
if (connection) {
  connection.on('error', (err) => {
    redisIsAvailable = false;
    if (process.env.NODE_ENV !== 'test') {
      console.warn('[Redis] Connection error. Operating in fallback outbox mode.', err.message);
    }
  });

  connection.on('ready', () => {
    redisIsAvailable = true;
  });
}

export let notificationQueue: Queue | null = null;
export let notificationWorker: Worker | null = null;

if ((hasRedis || isProduction) && connection) {
  notificationQueue = new Queue('notifications', { 
    connection,
    defaultJobOptions: {
      attempts: 5, // Increased attempts
      backoff: {
        type: 'exponential',
        delay: 2000, // Starting at 2 seconds
      },
      removeOnComplete: {
        age: 3600, // keep for 1 hour
        count: 1000,
      },
      removeOnFail: {
        age: 24 * 3600, // keep for 24 hours for inspection
      }
    },
  });

  /* Worker init moved to startWorkers */
}

export const saveToOutbox = async (type: string, payload: any) => {
  try {
    const prisma = standardPrisma; 
    await prisma.$executeRawUnsafe(`\
      INSERT INTO "OutboxEvent" (id, type, payload, status, "updatedAt") \
      VALUES (gen_random_uuid(), $1, $2::jsonb, 'PENDING', now())

    `, type, JSON.stringify(payload));
    console.log(`[Outbox] Saved ${type} to postgres outbox because redis was unavailable.`);
  } catch (error) {
    console.error(`[Outbox] Failed to save to outbox:`, error);
  }
};

export const enqueueSMS = async (phoneNumber: string, message: string): Promise<boolean> => {
  try {
    if (notificationQueue && redisIsAvailable) {
      await notificationQueue.add('send-sms', {
        type: 'SMS',
        payload: { phoneNumber, message }
      });
    } else {
      await saveToOutbox('SMS', { phoneNumber, message });
    }
    return true;
  } catch (error) {
    console.error('Failed to enqueue SMS:', error);
    return false;
  }
};

export const enqueueEmail = async (to: string, subject: string, html: string): Promise<boolean> => {
  try {
    if (notificationQueue && redisIsAvailable) {
      await notificationQueue.add('send-email', {
        type: 'EMAIL',
        payload: { to, subject, html }
      });
    } else {
      await saveToOutbox('EMAIL', { to, subject, html });
    }
    return true;
  } catch (error) {
    console.error('Failed to enqueue EMAIL:', error);
    return false;
  }
};

// Periodically process OutboxEvents
let outboxInterval: NodeJS.Timeout | null = null;
let isDbCircuitBreakerOpen = false;
let dbCircuitBreakerResetTime = 0;

export const startOutboxWorker = () => {
  if (outboxInterval) return;
  outboxInterval = setInterval(async () => {
    if (isDbCircuitBreakerOpen && Date.now() < dbCircuitBreakerResetTime) return;
    isDbCircuitBreakerOpen = false;
    try {
      const prisma = standardPrisma;
      const pendingEvents = await prisma.$queryRawUnsafe<any[]>(
        `SELECT * FROM "OutboxEvent" WHERE status = 'PENDING' LIMIT 50 FOR UPDATE SKIP LOCKED;`
      );
      
      for (const event of pendingEvents) {
        try {
          if (event.type === 'SMS') {
            await sendSMS(event.payload.phoneNumber, event.payload.message);
          } else if (event.type === 'EMBEDDING') {
            if (process.env.GEMINI_API_KEY) {
              try {
                const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
                const result = await ai.models.embedContent({
                  model: 'text-embedding-004', config: { outputDimensionality: 768 },
                  contents: event.payload.text,
                });
                const embedding = result.embeddings[0].values;
                const vectorString = `[${embedding.join(',')}]`;
                await standardPrisma.$executeRawUnsafe(`UPDATE "LoadPosting" SET embedding = $1::vector WHERE id = $2`, vectorString, event.payload.loadId);
              } catch (embedErr: any) {
                if (embedErr?.message?.includes('429') || embedErr?.message?.includes('depleted') || embedErr?.status === 429) {
                  console.warn('[Gemini] Rate limit or credits depleted in outbox worker. Skipping embedding.');
                } else {
                  throw embedErr;
                }
              }
            }
          } else if (event.type === 'EMAIL') {
            await sendEmailAlert(event.payload.to, event.payload.subject, event.payload.html);
          }
          
          await prisma.$executeRawUnsafe(
            `UPDATE "OutboxEvent" SET status = 'COMPLETED', "updatedAt" = now() WHERE id = $1;`,
            event.id
          );
        } catch (err) {
          console.error(`[Outbox Worker] Failed to process event ${event.id}:`, err);
          await prisma.$executeRawUnsafe(
            `UPDATE "OutboxEvent" SET status = 'FAILED', "updatedAt" = now() WHERE id = $1;`,
            event.id
          );
        }
      }
    } catch (err) {
      // Simple circuit breaker to prevent spamming logs and tripping database lockout
      isDbCircuitBreakerOpen = true;
      dbCircuitBreakerResetTime = Date.now() + 60000; // Pause for 60 seconds
      // Optional: Only log if we are debugging or every so often.
      // console.error('[Outbox Worker] DB unreachable, pausing outbox for 60s. Error:', err.message);
    }
  }, 10000); // every 10 seconds
};



export const enqueueLoadEmbedding = async (loadId: string, text: string): Promise<boolean> => {
  try {
    if (notificationQueue && redisIsAvailable) {
      await notificationQueue.add('embed-load', {
        type: 'EMBEDDING',
        payload: { loadId, text }
      });
    } else {
      await saveToOutbox('EMBEDDING', { loadId, text });
    }
    return true;
  } catch (error) {
    console.error('Failed to enqueue EMBEDDING:', error);
    return false;
  }
};

export const startWorkers = () => {
  if ((hasRedis || isProduction) && connection) {
    notificationWorker = new Worker('notifications', async (job: Job) => {
      const { type, payload } = job.data;
      if (type === 'SMS') {
        const { phoneNumber, message } = payload;
        const success = await sendSMS(phoneNumber, message);
        if (!success) throw new Error('SMS sending failed');
      } else if (type === 'EMBEDDING') {
        const { loadId, text } = payload;
        if (process.env.GEMINI_API_KEY) {
          try {
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
            const result = await ai.models.embedContent({
              model: 'text-embedding-004', config: { outputDimensionality: 768 },
              contents: text,
            });
            const embedding = result.embeddings[0].values;
            const vectorString = `[${embedding.join(',')}]`;
            await standardPrisma.$executeRawUnsafe(`UPDATE "LoadPosting" SET embedding = $1::vector WHERE id = $2`, vectorString, loadId);
          } catch (e: any) {
            if (e?.message?.includes('429') || e?.message?.includes('depleted') || e?.status === 429) {
              console.warn('[Gemini] Rate limit or credits depleted in redis worker. Skipping embedding.');
            } else {
              console.error('Failed to embed load:', e);
              throw e;
            }
          }
        }
      } else if (type === 'EMAIL') {
        const { to, subject, html } = payload;
        await sendEmailAlert(to, subject, html);
      }
    }, { connection });

    notificationWorker.on('completed', (job: Job) => {
      console.log(`Job ${job.id} completed successfully`);
    });

    notificationWorker.on('failed', async (job: Job | undefined, err: Error) => {
      if (job) {
        console.error(`Job ${job.id} failed with error ${err.message}. Attempts made: ${job.attemptsMade}`);
        if (job.attemptsMade >= (job.opts.attempts || 3)) {
          console.error(`[ALERT] Critical Job Failure. Job ${job.id} of type ${job.data?.type} permanently failed.`);
        }
      }
    });
  }
  startOutboxWorker();
};
