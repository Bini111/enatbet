/**
 * Production-ready distributed rate limiter using Upstash Redis
 * Supports both serverless (Redis) and local dev (in-memory fallback)
 * 
 * IMPORTANT: Requires environment variables:
 * - UPSTASH_REDIS_REST_URL
 * - UPSTASH_REDIS_REST_TOKEN
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Rate limit result with proper types
export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp in MILLISECONDS (Upstash standard)
  pending?: Promise<unknown>; // Edge analytics/multiregion replication
}

/**
 * Create Redis-backed rate limiter (production)
 * Uses sliding window algorithm for smooth rate limiting
 */
const createRedisLimiter = () => {
  try {
    // Validate required environment variables
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      console.warn('UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set. Using dev limiter.');
      return null;
    }

    const redis = Redis.fromEnv();
    
    return {
      auth: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, '15 m'),
        prefix: 'enatbet:rl:auth',
        analytics: true,
      }),
      api: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(100, '1 h'),
        prefix: 'enatbet:rl:api',
        analytics: true,
      }),
      payment: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '1 h'),
        prefix: 'enatbet:rl:payment',
        analytics: true,
      }),
      public: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(1000, '1 h'),
        prefix: 'enatbet:rl:public',
        analytics: true,
      }),
    };
  } catch (error) {
    console.warn('Redis initialization failed, falling back to in-memory rate limiter (DEV ONLY):', error);
    return null;
  }
};

/**
 * In-memory fallback for local development
 * WARNING: Not distributed, resets on restart, dev-only
 */
class DevRateLimiter {
  private store = new Map<string, { count: number; reset: number }>();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async limit(key: string): Promise<RateLimitResult> {
    const now = Date.now();
    const entry = this.store.get(key);

    // Cleanup opportunistically when store gets large
    if (this.store.size > 10000) {
      this.cleanup(now);
    }

    if (!entry || now > entry.reset) {
      this.store.set(key, {
        count: 1,
        reset: now + this.windowMs,
      });
      return {
        allowed: true,
        limit: this.maxRequests,
        remaining: this.maxRequests - 1,
        reset: now + this.windowMs, // milliseconds to match Upstash
      };
    }

    const allowed = entry.count < this.maxRequests;
    if (allowed) {
      entry.count++;
    }

    return {
      allowed,
      limit: this.maxRequests,
      remaining: Math.max(0, this.maxRequests - entry.count),
      reset: entry.reset, // milliseconds to match Upstash
    };
  }

  private cleanup(now: number): void {
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.reset) {
        this.store.delete(key);
      }
    }
  }
}

// Initialize rate limiters
const redisLimiters = createRedisLimiter();

// Dev fallback limiters
const devLimiters = {
  auth: new DevRateLimiter(5, 15 * 60 * 1000),
  api: new DevRateLimiter(100, 60 * 60 * 1000),
  payment: new DevRateLimiter(10, 60 * 60 * 1000),
  public: new DevRateLimiter(1000, 60 * 60 * 1000),
};

/**
 * Rate limit enforcement with automatic Redis/dev fallback
 * Returns result with pending promise for edge analytics
 */
export async function enforceRateLimit(
  key: string,
  type: 'auth' | 'api' | 'payment' | 'public' = 'api'
): Promise<RateLimitResult> {
  if (redisLimiters) {
    const { success, limit, remaining, reset, pending } = await redisLimiters[type].limit(key);
    return {
      allowed: success,
      limit,
      remaining,
      reset, // Already in milliseconds from Upstash
      pending,
    };
  }
  
  // Fallback to dev limiter
  return await devLimiters[type].limit(key);
}

/**
 * Apply standard rate limit headers to response
 * Converts reset from milliseconds to seconds for standard HTTP headers
 */
export function applyRateLimitHeaders(
  res: { setHeader: (key: string, value: string) => void },
  result: RateLimitResult
): void {
  res.setHeader('X-RateLimit-Limit', String(result.limit));
  res.setHeader('X-RateLimit-Remaining', String(result.remaining));
  // Convert milliseconds to seconds for standard HTTP header
  res.setHeader('X-RateLimit-Reset', String(Math.floor(result.reset / 1000)));
  
  if (!result.allowed) {
    // Calculate Retry-After in seconds
    const retryAfterSec = Math.max(0, Math.ceil((result.reset - Date.now()) / 1000));
    res.setHeader('Retry-After', String(retryAfterSec));
  }
}

/**
 * Extract identifier from request
 * Priority: userId > x-forwarded-for > x-real-ip > socket.remoteAddress
 * Vercel: x-forwarded-for is authoritative for client IP
 */
export function getRequestIdentifier(
  req: { 
    headers: Record<string, string | string[] | undefined>; 
    socket?: { remoteAddress?: string } 
  },
  userId?: string
): string {
  // Prefer user ID for authenticated requests
  if (userId) return `uid:${userId}`;
  
  // Extract IP with Vercel-compliant priority
  const xForwardedFor = req.headers['x-forwarded-for'];
  const xRealIp = req.headers['x-real-ip'];
  
  const ip = 
    (Array.isArray(xForwardedFor) 
      ? xForwardedFor[0] 
      : typeof xForwardedFor === 'string' 
        ? xForwardedFor.split(',')[0]?.trim() 
        : undefined) ||
    (typeof xRealIp === 'string' ? xRealIp : undefined) ||
    req.socket?.remoteAddress ||
    'unknown';
    
  return `ip:${ip}`;
}

export { Ratelimit, Redis };
