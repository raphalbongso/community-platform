import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { type NextRequest } from "next/server";

let ratelimit: Ratelimit | null = null;

function getRateLimiter(): Ratelimit | null {
  if (ratelimit) return ratelimit;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn("[RateLimiter] Upstash credentials not configured, rate limiting disabled");
    return null;
  }

  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(60, "1 m"), // 60 requests per minute
    analytics: true,
    prefix: "community:ratelimit",
  });

  return ratelimit;
}

/**
 * Apply rate limiting to a request.
 * Uses IP address for anonymous requests, user ID for authenticated ones.
 */
export async function applyRateLimit(
  request: NextRequest,
  identifier?: string
): Promise<void> {
  const limiter = getRateLimiter();
  if (!limiter) return; // Rate limiting disabled

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "anonymous";

  const key = identifier ?? ip;
  const { success, limit, remaining, reset } = await limiter.limit(key);

  if (!success) {
    throw new Response(
      JSON.stringify({
        success: false,
        error: {
          code: "RATE_LIMITED",
          message: "Too many requests, please try again later",
          details: { limit, remaining, resetAt: new Date(reset).toISOString() },
        },
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
          "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
        },
      }
    );
  }
}
