// app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

// Import Routes
const authRoutes = require('./routes/auth');
const storyRoutes = require('./routes/stories');
const userRoutes = require('./routes/users');
const chatRoutes = require('./routes/chats');
const aiRoutes = require('./routes/ai');

const app = express();

// Trust proxy for rate limiting (important for Render)
app.set('trust proxy', 1);

// ✅ CORS Configuration for Render
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://127.0.0.1:3002',
  'https://failfixes-frontend.onrender.com',
  'https://failfixes.onrender.com',
  process.env.FRONTEND_URL,
].filter(Boolean); // Remove undefined values

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log('⚠️  CORS blocked origin:', origin);
        console.log('✅ Allowed origins:', allowedOrigins);
        // In production you might want to block here instead of allowing:
        callback(null, true);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
  })
);

// Handle preflight requests
app.options('*', cors());

// ✅ BODY PARSING - MUST BE BEFORE ROUTES
app.use(
  express.json({
    limit: '10mb',
    strict: false,
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '10mb',
  })
);

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));

  // Debug middleware (only in development)
  app.use((req, res, next) => {
    console.log(`\n🌐 === REQUEST LOG ===`);
    console.log(`${req.method} ${req.originalUrl}`);
    console.log('Headers:', {
      'content-type': req.headers['content-type'],
      authorization: req.headers.authorization ? 'Bearer [PRESENT]' : 'None',
      origin: req.headers.origin,
    });
    if (Object.keys(req.body).length > 0) {
      console.log('Body:', req.body);
    }
    if (Object.keys(req.params).length > 0) {
      console.log('Params:', req.params);
    }
    if (Object.keys(req.query).length > 0) {
      console.log('Query:', req.query);
    }
    console.log('=== END LOG ===\n');
    next();
  });
} else {
  // Production logging (minimal)
  app.use(morgan('combined'));
}

// ✅ ROOT ENDPOINT
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'FailFixes API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    features: [
      'auth',
      'stories',
      'users',
      'chats',
      'realtime-chat',
      'ai-story-generation',
    ],
  });
});

// ✅ HEALTH CHECK (Important for Render)
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    features: {
      auth: 'active',
      stories: 'active',
      users: 'active',
      chats: 'active',
      socketIO: 'active',
      ai: process.env.GROQ_API_KEY ? 'active' : 'inactive',
    },
  });
});

// ✅ API ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/ai', aiRoutes);

// ✅ 404 Handler
app.use('*', (req, res) => {
  console.log(`❌ 404: ${req.method} ${req.originalUrl} not found`);
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableEndpoints: {
      root: 'GET /',
      health: 'GET /health or /api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
        verifyEmail: 'GET /api/auth/verify-email/:token', // ✅ added
      },
      stories: {
        list: 'GET /api/stories',
        byId: 'GET /api/stories/:id',
        create: 'POST /api/stories',
        like: 'POST /api/stories/:id/like',
        view: 'POST /api/stories/:id/view',
      },
      users: {
        profile: 'GET /api/users/profile/:username',
        follow: 'POST /api/users/:username/follow',
        dashboard: 'GET /api/users/dashboard',
      },
      chats: {
        list: 'GET /api/chats',
        create: 'POST /api/chats/direct',
        messages: 'GET /api/chats/:chatId/messages',
      },
      ai: {
        generate: 'POST /api/ai/generate-story',
      },
    },
  });
});

// ✅ GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  console.error('\n❌ === GLOBAL ERROR ===');
  console.error('URL:', req.originalUrl);
  console.error('Method:', req.method);
  console.error('Error:', err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error('Stack:', err.stack);
  }
  console.error('=== END ERROR ===\n');

  res.status(err.statusCode || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message,
    ...(process.env.NODE_ENV === 'development' && {
      error: err.message,
      stack: err.stack,
    }),
  });
});

module.exports = app;
