import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// In-memory fallback if Redis is not available
class MemoryRedis {
  private store = new Map<string, { value: string; expiresAt?: number }>();
  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }
  async set(key: string, value: string, ex?: 'EX', seconds?: number, nx?: 'NX'): Promise<'OK' | null> {
    if (nx === 'NX' && await this.get(key) !== null) {
      return null;
    }
    this.store.set(key, {
      value,
      expiresAt: seconds ? Date.now() + seconds * 1000 : undefined,
    });
    return 'OK';
  }
  async setex(key: string, seconds: number, value: string): Promise<'OK'> {
    await this.set(key, value, 'EX', seconds);
    return 'OK';
  }
  async del(key: string): Promise<number> {
    return this.store.delete(key) ? 1 : 0;
  }
}

let redisInstance: any;

if (process.env.REDIS_URL) {
  try {
    const client = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      retryStrategy: () => null,
      lazyConnect: true,
    });

    client.on('error', () => {
      // Suppress unhandled redis connection error in environments without Redis
    });

    redisInstance = client;
  } catch {
    redisInstance = new MemoryRedis();
  }
} else {
  redisInstance = new MemoryRedis();
}

export const redis = redisInstance;
