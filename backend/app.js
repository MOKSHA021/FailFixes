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
const aiRoutes = require('./routes/ai'); // ✅ ADD AI ROUTES

const app = express();

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// ✅ CORS - MUST BE FIRST
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://localhost:3002',  // ✅ Add any other dev port you use!
    'http://127.0.0.1:3002'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept', 
    'Origin'
  ]
}));

// Handle preflight requests
app.options('*', cors());

// ✅ BODY PARSING - MUST BE BEFORE ROUTES
app.use(express.json({ 
  limit: '10mb',
  strict: false
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ✅ GLOBAL DEBUG MIDDLEWARE
app.use((req, res, next) => {
  console.log(`\n🌐 === GLOBAL REQUEST LOG ===`);
  console.log(`${req.method} ${req.originalUrl}`);
  console.log('Headers:', {
    'content-type': req.headers['content-type'],
    'authorization': req.headers.authorization ? 'Bearer [PRESENT]' : 'None',
    'origin': req.headers.origin
  });
  console.log('Body:', req.body);
  console.log('Params:', req.params);
  console.log('Query:', req.query);
  console.log('=== END GLOBAL LOG ===\n');
  next();
});

// ✅ API ROUTES (ORDER DOES NOT MATTER FOR THESE)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/ai', aiRoutes); // ✅ ADD AI ROUTE

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'FailFixes API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    features: ['auth', 'stories', 'users', 'chats', 'realtime-chat', 'ai-story'] // ✅ ADD AI
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    features: {
      auth: 'active',
      stories: 'active', 
      users: 'active',
      chats: 'active',
      socketIO: 'active',
      ai: 'active' // ✅ ADD AI
    }
  });
});

// ✅ 404 Handler
app.use('*', (req, res) => {
  console.log(`❌ 404: ${req.method} ${req.originalUrl} not found`);
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableRoutes: [
      'GET /api/health',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'POST /api/users/:username/follow',
      'GET /api/chats',
      'POST /api/chats/direct',
      'GET /api/chats/:chatId/messages',
      'POST /api/ai/generate-story' // ✅ AI ROUTE
    ]
  });
});

// ✅ GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  console.error('\n❌ === GLOBAL ERROR ===');
  console.error('URL:', req.originalUrl);
  console.error('Method:', req.method);
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  console.error('=== END ERROR ===\n');
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    ...(process.env.NODE_ENV === 'development' && { 
      error: err.message,
      stack: err.stack 
    })
  });
});

module.exports = app;
