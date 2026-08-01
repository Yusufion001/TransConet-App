// src/workers/embeddingRetryWorker.ts
import { prismaBypass } from '../db/prisma';
import { enqueueLoadEmbedding } from '../services/aiQueue';

export const startEmbeddingRetryWorker = () => {
  // Run sweep every 5 minutes
  setInterval(async () => {
    try {
      // 1. Fetch loads that have failed but haven't hit the 5-retry limit
      const candidates = await (prismaBypass as any).loadPosting.findMany({
        where: { 
          embeddingStatus: 'FAILED',
          embeddingRetries: { lt: 5 } 
        },
        take: 50,
      });

      const now = new Date();

      for (const load of candidates) {
        // 2. Exponential backoff math: 2^retries * 5 minutes 
        // Attempt 1: 5 mins, Attempt 2: 10 mins, Attempt 3: 20 mins...
        const backoffMinutes = Math.pow(2, load.embeddingRetries || 0) * 5;
        const cooldownMs = backoffMinutes * 60 * 1000;
        const timeSinceLastFailure = now.getTime() - new Date(load.updatedAt).getTime();

        // 3. Skip if still in cooldown period
        if (timeSinceLastFailure < cooldownMs) continue;

        try {
          await enqueueLoadEmbedding(load.id, load.title || load.description || '');
          
          // On success, update status
          await (prismaBypass as any).loadPosting.update({
            where: { id: load.id },
            data: { embeddingStatus: 'QUEUED' }
          });
        } catch (error) {
          // On failure, increment the retry counter
          await (prismaBypass as any).loadPosting.update({
            where: { id: load.id },
            data: { embeddingRetries: { increment: 1 } }
          });
        }
      }
    } catch (error: any) {
      if (error?.code === 'P2021' || error?.code === 'P2022' || error?.message?.includes('embeddingStatus') || error?.message?.includes('does not exist')) {
        return;
      }
      console.warn('[Worker] Retry sweep skipped:', error?.message || error);
    }
  }, 5 * 60 * 1000); 
};
