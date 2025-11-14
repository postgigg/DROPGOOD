/**
 * Advanced Distributed Rate Limiter
 * Supports multiple strategies and can be extended with Redis/Upstash
 *
 * For production with Redis:
 * - Install Upstash Redis: https://upstash.com
 * - Set environment variables: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
 */

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

export interface RateLimitStore {
  get(key: string): Promise<RateLimitEntry | null>;
  set(key: string, entry: RateLimitEntry): Promise<void>;
  increment(key: string, windowMs: number): Promise<RateLimitEntry>;
}

export interface RateLimitEntry {
  count: number;
  resetAt: number;
  blocked?: boolean;
  blockUntil?: number;
}

/**
 * In-Memory Rate Limit Store (fallback)
 */
export class InMemoryRateLimitStore implements RateLimitStore {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval: number;

  constructor() {
    // Clean up old entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.store.entries()) {
        if (entry.resetAt < now && (!entry.blockUntil || entry.blockUntil < now)) {
          this.store.delete(key);
        }
      }
    }, 5 * 60 * 1000) as unknown as number;
  }

  async get(key: string): Promise<RateLimitEntry | null> {
    return this.store.get(key) || null;
  }

  async set(key: string, entry: RateLimitEntry): Promise<void> {
    this.store.set(key, entry);
  }

  async increment(key: string, windowMs: number): Promise<RateLimitEntry> {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || entry.resetAt < now) {
      const newEntry: RateLimitEntry = {
        count: 1,
        resetAt: now + windowMs,
      };
      this.store.set(key, newEntry);
      return newEntry;
    }

    entry.count++;
    this.store.set(key, entry);
    return entry;
  }
}

/**
 * Redis-based Rate Limit Store (for production)
 */
export class RedisRateLimitStore implements RateLimitStore {
  private redisUrl: string;
  private redisToken: string;

  constructor(redisUrl: string, redisToken: string) {
    this.redisUrl = redisUrl;
    this.redisToken = redisToken;
  }

  private async executeRedisCommand(command: string[]): Promise<any> {
    const response = await fetch(this.redisUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.redisToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(command),
    });

    if (!response.ok) {
      throw new Error(`Redis command failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.result;
  }

  async get(key: string): Promise<RateLimitEntry | null> {
    try {
      const value = await this.executeRedisCommand(['GET', key]);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  async set(key: string, entry: RateLimitEntry): Promise<void> {
    try {
      const ttl = Math.ceil((entry.resetAt - Date.now()) / 1000);
      await this.executeRedisCommand([
        'SET',
        key,
        JSON.stringify(entry),
        'EX',
        Math.max(ttl, 1).toString(),
      ]);
    } catch (error) {
      console.error('Redis SET error:', error);
    }
  }

  async increment(key: string, windowMs: number): Promise<RateLimitEntry> {
    try {
      const now = Date.now();
      const existing = await this.get(key);

      if (!existing || existing.resetAt < now) {
        const newEntry: RateLimitEntry = {
          count: 1,
          resetAt: now + windowMs,
        };
        await this.set(key, newEntry);
        return newEntry;
      }

      existing.count++;
      await this.set(key, existing);
      return existing;
    } catch (error) {
      console.error('Redis INCREMENT error:', error);
      // Fallback to conservative limit
      return { count: 999, resetAt: Date.now() + windowMs };
    }
  }
}

/**
 * Create rate limit store (auto-detects Redis availability)
 */
export function createRateLimitStore(): RateLimitStore {
  const redisUrl = Deno.env.get('UPSTASH_REDIS_REST_URL');
  const redisToken = Deno.env.get('UPSTASH_REDIS_REST_TOKEN');

  if (redisUrl && redisToken) {
    console.log('Using Redis-based rate limiting');
    return new RedisRateLimitStore(redisUrl, redisToken);
  }

  console.log('Using in-memory rate limiting (consider Redis for production)');
  return new InMemoryRateLimitStore();
}

/**
 * Advanced Rate Limiter with multiple strategies
 */
export class AdvancedRateLimiter {
  private store: RateLimitStore;

  constructor(store?: RateLimitStore) {
    this.store = store || createRateLimitStore();
  }

  /**
   * Check rate limit with sliding window algorithm
   */
  async checkLimit(
    identifier: string,
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const entry = await this.store.increment(identifier, config.windowMs);

    // Check if blocked
    if (entry.blocked && entry.blockUntil && entry.blockUntil > now) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: entry.resetAt,
        retryAfter: Math.ceil((entry.blockUntil - now) / 1000),
      };
    }

    // Check rate limit
    if (entry.count > config.maxRequests) {
      // Block for progressively longer periods based on violations
      const violations = entry.count - config.maxRequests;
      const blockDuration = Math.min(violations * 60 * 1000, 3600000); // Max 1 hour

      entry.blocked = true;
      entry.blockUntil = now + blockDuration;
      await this.store.set(identifier, entry);

      return {
        allowed: false,
        remaining: 0,
        resetAt: entry.resetAt,
        retryAfter: Math.ceil(blockDuration / 1000),
      };
    }

    return {
      allowed: true,
      remaining: Math.max(0, config.maxRequests - entry.count),
      resetAt: entry.resetAt,
    };
  }

  /**
   * Get rate limit identifier from request
   */
  getIdentifier(req: Request, type: 'ip' | 'user' | 'endpoint' = 'ip'): string {
    if (type === 'ip') {
      // Try to get real IP from headers (Cloudflare, AWS, etc.)
      const cfIP = req.headers.get('cf-connecting-ip');
      const xForwardedFor = req.headers.get('x-forwarded-for');
      const xRealIP = req.headers.get('x-real-ip');

      return cfIP || xForwardedFor?.split(',')[0] || xRealIP || 'unknown';
    }

    if (type === 'user') {
      const auth = req.headers.get('authorization');
      return auth ? `user:${auth.substring(0, 20)}` : 'anonymous';
    }

    if (type === 'endpoint') {
      const url = new URL(req.url);
      return `endpoint:${url.pathname}`;
    }

    return 'unknown';
  }

  /**
   * Multi-tier rate limiting (IP + User + Endpoint)
   */
  async checkMultiTierLimit(
    req: Request,
    configs: {
      ip?: RateLimitConfig;
      user?: RateLimitConfig;
      endpoint?: RateLimitConfig;
    }
  ): Promise<RateLimitResult> {
    // Check IP-based limit
    if (configs.ip) {
      const ipIdentifier = this.getIdentifier(req, 'ip');
      const ipResult = await this.checkLimit(ipIdentifier, configs.ip);
      if (!ipResult.allowed) {
        return ipResult;
      }
    }

    // Check user-based limit
    if (configs.user) {
      const userIdentifier = this.getIdentifier(req, 'user');
      const userResult = await this.checkLimit(userIdentifier, configs.user);
      if (!userResult.allowed) {
        return userResult;
      }
    }

    // Check endpoint-based limit
    if (configs.endpoint) {
      const endpointIdentifier = this.getIdentifier(req, 'endpoint');
      const endpointResult = await this.checkLimit(endpointIdentifier, configs.endpoint);
      if (!endpointResult.allowed) {
        return endpointResult;
      }
    }

    return {
      allowed: true,
      remaining: 999,
      resetAt: Date.now() + 60000,
    };
  }
}

/**
 * Get rate limit response headers
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': '100',
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetAt).toISOString(),
  };

  if (result.retryAfter) {
    headers['Retry-After'] = result.retryAfter.toString();
  }

  return headers;
}

/**
 * Create rate limit error response
 */
export function rateLimitExceededResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      retryAfter: result.retryAfter,
      resetAt: new Date(result.resetAt).toISOString(),
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        ...getRateLimitHeaders(result),
      },
    }
  );
}
