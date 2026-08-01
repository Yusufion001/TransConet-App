import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { Request, Response, NextFunction } from "express";

let redis: Redis | null = null;
const limiters: Record<string, Ratelimit> = {};

const getLimiter = (path: string) => {
  if (!redis) {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_REST_URL.includes("dummy")) {
      return null;
    }
    const rawUrl = process.env.UPSTASH_REDIS_REST_URL.replace(/"/g, "");
    const cleanUrl = rawUrl.split(" ")[0];
    let cleanToken = process.env.UPSTASH_REDIS_REST_TOKEN.replace(/"/g, "");
    
    if (rawUrl.includes("UPSTASH_REDIS_REST_TOKEN=")) {
      const match = rawUrl.match(/UPSTASH_REDIS_REST_TOKEN=([^\s]+)/);
      if (match && match[1]) {
        cleanToken = match[1];
      }
    }
    
    redis = new Redis({ url: cleanUrl, token: cleanToken });
  }

  let limit = 20;
  let window = "10 s";

  if (path.startsWith('/api/auth/login') || path.startsWith('/api/auth/register')) {
    limit = 5;
    window = "1 m";
  } else if (path.startsWith('/api/payments')) {
    limit = 5;
    window = "1 m";
  } else if (path.includes('/upload')) {
    limit = 5;
    window = "1 m";
  } else if (path.startsWith('/api/auth/request-otp')) {
    limit = 3;
    window = "1 m";
  }

  const key = `${limit}-${window}`;
  if (!limiters[key]) {
    limiters[key] = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, window as any),
      analytics: true,
      prefix: `@upstash/ratelimit/${key}`,
    });
  }

  return limiters[key];
};

export const rateLimitMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const limiter = getLimiter(req.path);
  if (!limiter) {
    return next();
  }

  let identifier = req.ip || (req.headers["x-forwarded-for"] as string) || "anonymous_user";
  if (identifier.includes(',')) {
    identifier = identifier.split(',')[0].trim();
  }

  try {
    const { success, limit, remaining, reset } = await limiter.limit(identifier);
    res.setHeader("X-RateLimit-Limit", limit);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", reset);

    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000);
      return res.status(429).json({
        error: "Too Many Requests",
        message: "You have exceeded your request limit. Please try again later.",
        retryAfter: `${retryAfter} seconds`,
      });
    }

    next();
  } catch (error) {
    console.error("Rate limiting error:", error);
    next();
  }
};
