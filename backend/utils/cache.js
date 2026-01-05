const { getRedisClient, isRedisConnected } = require('../config/redis');

/**
 * Cache utility class for managing Redis cache
 */
class Cache {
  /**
   * Get data from cache
   * @param {string} key - Cache key
   * @returns {Promise<any|null>} - Cached data or null
   */
  static async get(key) {
    if (!isRedisConnected()) return null;

    try {
      const client = getRedisClient();
      const data = await client.get(key);
      
      if (data) {
        console.log(`✅ Cache HIT: ${key}`);
        return JSON.parse(data);
      }
      
      console.log(`❌ Cache MISS: ${key}`);
      return null;
    } catch (error) {
      console.error('❌ Cache GET error:', error.message);
      return null;
    }
  }

  /**
   * Set data in cache with TTL
   * @param {string} key - Cache key
   * @param {any} value - Data to cache
   * @param {number} ttl - Time to live in seconds (default: 300 = 5 minutes)
   * @returns {Promise<boolean>} - Success status
   */
  static async set(key, value, ttl = 300) {
    if (!isRedisConnected()) return false;

    try {
      const client = getRedisClient();
      const serialized = JSON.stringify(value);
      await client.setEx(key, ttl, serialized);
      console.log(`💾 Cache SET: ${key} (TTL: ${ttl}s)`);
      return true;
    } catch (error) {
      console.error('❌ Cache SET error:', error.message);
      return false;
    }
  }

  /**
   * Delete specific cache key
   * @param {string} key - Cache key to delete
   * @returns {Promise<boolean>} - Success status
   */
  static async delete(key) {
    if (!isRedisConnected()) return false;

    try {
      const client = getRedisClient();
      const result = await client.del(key);
      console.log(`🗑️ Cache DELETE: ${key} (deleted: ${result})`);
      return result > 0;
    } catch (error) {
      console.error('❌ Cache DELETE error:', error.message);
      return false;
    }
  }

  /**
   * Delete all cache keys matching a pattern
   * @param {string} pattern - Pattern to match (e.g., 'stories:*')
   * @returns {Promise<number>} - Number of keys deleted
   */
  static async deletePattern(pattern) {
    if (!isRedisConnected()) return 0;

    try {
      const client = getRedisClient();
      const keys = await client.keys(pattern);
      
      if (keys.length === 0) {
        console.log(`⚠️ No keys found for pattern: ${pattern}`);
        return 0;
      }

      const result = await client.del(keys);
      console.log(`🗑️ Cache DELETE PATTERN: ${pattern} (deleted: ${result} keys)`);
      return result;
    } catch (error) {
      console.error('❌ Cache DELETE PATTERN error:', error.message);
      return 0;
    }
  }

  /**
   * Invalidate all stories cache
   */
  static async invalidateStories() {
    await this.deletePattern('stories:*');
    console.log('🗑️ Stories cache invalidated');
  }

  /**
   * Invalidate specific story cache
   * @param {string} storyId - Story ID
   */
  static async invalidateStory(storyId) {
    await this.delete(`story:${storyId}`);
    await this.deletePattern('stories:*'); // Also clear stories list
    console.log(`🗑️ Story cache invalidated: ${storyId}`);
  }

  /**
   * Invalidate user cache
   * @param {string} userId - User ID
   */
  static async invalidateUser(userId) {
    await this.deletePattern(`user:${userId}:*`);
    await this.deletePattern(`dashboard:${userId}:*`);
    console.log(`🗑️ User cache invalidated: ${userId}`);
  }

  /**
   * Clear all cache
   */
  static async clearAll() {
    if (!isRedisConnected()) return false;

    try {
      const client = getRedisClient();
      await client.flushDb();
      console.log('🗑️ All cache cleared');
      return true;
    } catch (error) {
      console.error('❌ Cache CLEAR ALL error:', error.message);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  static async getStats() {
    if (!isRedisConnected()) {
      return { 
        connected: false, 
        message: 'Redis not connected' 
      };
    }

    try {
      const client = getRedisClient();
      const dbSize = await client.dbSize();
      const info = await client.info('stats');
      
      return {
        connected: true,
        totalKeys: dbSize,
        info: info
      };
    } catch (error) {
      console.error('❌ Cache STATS error:', error.message);
      return { 
        connected: false, 
        error: error.message 
      };
    }
  }

  /**
   * Cache middleware for Express routes
   * @param {string} keyPrefix - Prefix for cache key
   * @param {number} ttl - Time to live in seconds
   */
  static middleware(keyPrefix, ttl = 300) {
    return async (req, res, next) => {
      // Only cache GET requests
      if (req.method !== 'GET' || !isRedisConnected()) {
        return next();
      }

      try {
        // Generate cache key from URL and query params
        const queryString = JSON.stringify(req.query);
        const userId = req.user ? req.user._id : 'guest';
        const cacheKey = `${keyPrefix}:${req.path}:${userId}:${queryString}`;

        // Try to get cached data
        const cachedData = await this.get(cacheKey);

        if (cachedData) {
          return res.json({
            ...cachedData,
            fromCache: true,
            cacheKey: keyPrefix
          });
        }

        // Store original res.json
        const originalJson = res.json.bind(res);

        // Override res.json to cache response
        res.json = function(data) {
          // Cache successful responses
          if (res.statusCode === 200 && data.success !== false) {
            Cache.set(cacheKey, data, ttl)
              .catch(err => console.error('Cache save error:', err));
          }
          
          return originalJson(data);
        };

        next();
      } catch (error) {
        console.error('❌ Cache middleware error:', error.message);
        next();
      }
    };
  }
}

module.exports = Cache;
