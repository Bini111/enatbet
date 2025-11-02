import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export class RateLimiter {
  private windowMs: number;
  private max: number;

  constructor(config: { windowMs: number; max: number }) {
    this.windowMs = config.windowMs;
    this.max = config.max;
  }

  async check(key: string): Promise<boolean> {
    const now = Date.now();
    const windowKey = `ratelimit:${key}:${Math.floor(now / this.windowMs)}`;

    try {
      const count = await redis.incr(windowKey);
      if (count === 1) {
        await redis.expire(windowKey, Math.ceil(this.windowMs / 1000));
      }
      return count <= this.max;
    } catch (error) {
      console.error('Rate limiter error:', error);
      // Fail-open to avoid blocking legit traffic if Redis blips.
      return true;
    }
  }

  async getRemainingRequests(key: string): Promise<number> {
    const now = Date.now();
    const windowKey = `ratelimit:${key}:${Math.floor(now / this.windowMs)}`;
    const count = (await redis.get<number>(windowKey)) || 0;
    return Math.max(0, this.max - count);
  }
}
