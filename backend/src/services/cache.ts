// src/services/cache.ts
import { redis } from '../utils/redis';
import { prismaBypass } from '../db/prisma';

export const getDashboardAggregates = async (tenantId: string) => {
  const cacheKey = `dashboard:aggregates:${tenantId}`;
  
  // 1. Try Cache
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // 2. Fetch via Bypass Client (No RLS Transaction Tax)
  const stats = await (prismaBypass as any).order.groupBy({
    by: ['status'],
    where: { tenantId },
    _count: { id: true }
  });

  // 3. Set Cache (TTL: 60 seconds)
  await redis.setex(cacheKey, 60, JSON.stringify(stats));
  
  return stats;
};
