const redis = require('redis');

let redisClient = null;
let isConnecting = false;

/**
 * Connect to Redis Cloud
 */
const connectRedis = async () => {
  // Prevent multiple connection attempts
  if (isConnecting) {
    console.log('⏳ Redis connection already in progress...');
    return redisClient;
  }

  // Check if already connected
  if (redisClient && redisClient.isOpen) {
    console.log('✅ Redis already connected');
    return redisClient;
  }

  isConnecting = true;

  try {
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
      console.warn('⚠️ REDIS_URL not found in environment variables');
      console.log('ℹ️ App will continue without caching');
      isConnecting = false;
      return null;
    }

    console.log('🔄 Connecting to Redis Cloud...');

    // Create Redis client
    redisClient = redis.createClient({
      url: redisUrl,
      socket: {
        connectTimeout: 10000, // 10 seconds
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error('❌ Redis reconnection limit reached');
            return new Error('Redis reconnection failed');
          }
          const delay = Math.min(retries * 100, 3000);
          console.log(`🔄 Redis reconnecting in ${delay}ms... (attempt ${retries})`);
          return delay;
        }
      }
    });

    // Event listeners
    redisClient.on('error', (err) => {
      console.error('❌ Redis Error:', err.message);
    });

    redisClient.on('connect', () => {
      console.log('🔄 Redis connecting...');
    });

    redisClient.on('ready', () => {
      console.log('✅ Redis connected and ready!');
      console.log('📊 Cache enabled for high-performance queries');
    });

    redisClient.on('reconnecting', () => {
      console.log('🔄 Redis reconnecting...');
    });

    redisClient.on('end', () => {
      console.log('⚠️ Redis connection closed');
    });

    // Connect
    await redisClient.connect();

    // Test connection
    await redisClient.ping();
    console.log('🏓 Redis PING successful');

    isConnecting = false;
    return redisClient;

  } catch (error) {
    isConnecting = false;
    console.error('❌ Redis connection failed:', error.message);
    console.log('⚠️ App will continue without caching');
    redisClient = null;
    return null;
  }
};

/**
 * Get Redis client instance
 */
const getRedisClient = () => {
  return redisClient;
};

/**
 * Check if Redis is connected
 */
const isRedisConnected = () => {
  return redisClient && redisClient.isOpen;
};

/**
 * Disconnect Redis gracefully
 */
const disconnectRedis = async () => {
  if (redisClient && redisClient.isOpen) {
    try {
      await redisClient.quit();
      console.log('✅ Redis disconnected gracefully');
    } catch (error) {
      console.error('❌ Error disconnecting Redis:', error.message);
      await redisClient.disconnect();
    }
  }
};

module.exports = {
  connectRedis,
  getRedisClient,
  isRedisConnected,
  disconnectRedis
};
