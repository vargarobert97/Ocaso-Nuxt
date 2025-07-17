import { createStorage } from 'unstorage';
import memoryDriver from 'unstorage/drivers/memory';
import { Redis } from '@upstash/redis';

// Initialize Redis for production AND Vercel
const redis = process.env.NODE_ENV === 'production' && process.env.VERCEL ? Redis.fromEnv() : null;

// Create server-side storage instance for non-Vercel environments
const serverStorage = createStorage({
  driver: memoryDriver(),
});

/**
 * Get an item from storage
 */
export async function getStorageItem<T>(key: string): Promise<T | null> {
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL && redis) {
    // Use Redis for production AND Vercel
    try {
      const result = await redis.get(key);
      return result && typeof result === 'string' ? JSON.parse(result) : null;
    } catch (error) {
      console.error(`Failed to get Redis key ${key}:`, error);
      return null;
    }
  } else {
    // Use unstorage for development OR production (not Vercel)
    try {
      return (await serverStorage.getItem(key)) as T | null;
    } catch (error) {
      console.error(`Failed to get server storage key ${key}:`, error);
      return null;
    }
  }
}

/**
 * Set an item in storage
 */
export async function setStorageItem<T>(key: string, value: T, options?: { ttl?: number }): Promise<void> {
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL && redis) {
    // Cache in Redis for production AND Vercel
    try {
      await redis.set(key, JSON.stringify(value), { ex: options?.ttl || 3600 });
    } catch (error) {
      console.error(`Failed to set Redis key ${key}:`, error);
    }
  } else {
    // Cache in unstorage for development OR production (not Vercel)
    try {
      await serverStorage.setItem(key, value as unknown as Record<string, unknown>, { ttl: options?.ttl || 3600 });
    } catch (error) {
      console.error(`Failed to set server storage key ${key}:`, error);
    }
  }
}

/**
 * Remove an item from storage
 */
export async function removeStorageItem(key: string): Promise<void> {
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL && redis) {
    // Clear from Redis
    try {
      await redis.del(key);
    } catch (error) {
      console.error(`Failed to clear Redis key ${key}:`, error);
    }
  } else {
    // Clear from server storage
    try {
      await serverStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to clear server storage key ${key}:`, error);
    }
  }
}

/**
 * Clear all items from storage
 */
export async function clearStorage(): Promise<void> {
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL && redis) {
    // Clear all keys from Redis (be careful with this in production)
    try {
      const keys = await redis.keys('*');
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error('Failed to clear all Redis keys:', error);
    }
  } else {
    // Clear all keys from server storage
    try {
      await serverStorage.clear();
    } catch (error) {
      console.error('Failed to clear all server storage keys:', error);
    }
  }
}

/**
 * Check if an item exists in storage
 */
export async function hasStorageItem(key: string): Promise<boolean> {
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL && redis) {
    try {
      const result = await redis.get(key);
      return result !== null;
    } catch (error) {
      console.error(`Failed to check Redis key ${key}:`, error);
      return false;
    }
  } else {
    try {
      return await serverStorage.hasItem(key);
    } catch (error) {
      console.error(`Failed to check server storage key ${key}:`, error);
      return false;
    }
  }
}

// Note: This storage is only used on the server side
// Client-side components fetch fresh data from the server API 