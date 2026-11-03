import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis = redisUrl && redisToken
  ? new Redis({ url: redisUrl, token: redisToken })
  : null;

export async function getOrSetCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlInSeconds: number,
): Promise<T> {
  if (!redis) return fetchFn();

  try {
    const cached = await redis.get<T>(key);
    if (cached !== null && cached !== undefined) {
      return typeof cached === "string" ? JSON.parse(cached) as T : cached;
    }
  } catch (error) {
    console.error("Redis cache read failed", { key, error });
    return fetchFn();
  }

  const fresh = await fetchFn();
  try {
    await redis.set(key, fresh, { ex: ttlInSeconds });
  } catch (error) {
    console.error("Redis cache write failed", { key, error });
  }
  return fresh;
}

export async function invalidateCache(key: string) {
  if (!redis) return;
  try {
    await redis.del(key);
  } catch (error) {
    console.error("Redis cache invalidation failed", { key, error });
  }
}
