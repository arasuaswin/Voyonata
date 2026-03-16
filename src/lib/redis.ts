import Redis from 'ioredis';

// Singleton pattern for the Redis client to prevent overwhelming the connection pool
const getRedisClient = () => {
  // During build time, always use memory fallback
  if (process.env.REDIS_URL && typeof window === 'undefined') {
    try {
      console.log('Connecting to Redis...');
      const client = new Redis(process.env.REDIS_URL, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        retryStrategy: (times: number) => {
          if (times > 3) return null; // Stop retrying after 3 attempts
          return Math.min(times * 200, 2000);
        },
      });
      
      // Suppress unhandled error events (e.g. during build)
      client.on('error', (err: Error) => {
        console.warn('Redis connection error (falling back to memory):', err.message);
      });

      return client;
    } catch {
      // Fall through to memory fallback
    }
  }
  
  console.warn('Using local memory fallback for rate limiting. This is NOT suitable for Multi-Instance Production.');
  // If no Redis URL is provided (e.g. local dev without docker), we return a mocked Redis interface 
  // so the application doesn't crash, but rate limiting works in memory.
  const memStore = new Map<string, string>();
  return {
    get: async (key: string) => memStore.get(key) || null,
    set: async (key: string, value: string, param1?: string, param2?: number) => {
      memStore.set(key, value);
      if (param1 === 'EX' && param2) {
        setTimeout(() => memStore.delete(key), param2 * 1000);
      }
      return 'OK';
    },
    incr: async (key: string) => {
      const current = parseInt(memStore.get(key) || '0', 10);
      const next = current + 1;
      memStore.set(key, next.toString());
      return next;
    },
    expire: async (key: string, seconds: number) => {
      setTimeout(() => memStore.delete(key), seconds * 1000);
      return 1;
    },
    del: async (key: string) => {
      const existed = memStore.delete(key);
      return existed ? 1 : 0;
    }
  } as any;
};

const redis = global.redisClient || getRedisClient();

if (process.env.NODE_ENV !== 'production') {
  global.redisClient = redis;
}

export default redis;

declare global {
  var redisClient: any;
}

