require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/failfixes',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE) || 10,
      minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE) || 1,
      connectTimeoutMS: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 30000,
    }
  },
  
  jwt: {
    secret: process.env.JWT_SECRET,
    expire: process.env.JWT_EXPIRE || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || '30d'
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    authMaxRequests: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 10
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000']
  },
  
  content: {
    maxStoryLength: parseInt(process.env.MAX_STORY_LENGTH) || 50000,
    minStoryLength: parseInt(process.env.MIN_STORY_LENGTH) || 100,
    maxTagsPerStory: parseInt(process.env.MAX_TAGS_PER_STORY) || 5,
    maxTagLength: parseInt(process.env.MAX_TAG_LENGTH) || 30
  }
};
