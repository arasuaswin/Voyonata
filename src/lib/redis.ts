import Redis from 'ioredis';

// Singleton pattern for the Redis client to prevent overwhelming the connection pool
const getRedisClient = () => {
  if (process.env.REDIS_URL) {
    console.log('Connecting to Redis...');
    return new Redis(process.env.REDIS_URL);
  }
  
  console.warn('REDIS_URL is not set. Using local memory fallback. This is NOT suitable for Multi-Instance Production.');
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
