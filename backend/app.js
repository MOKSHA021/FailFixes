const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const config = require('./config/config');
const { errorHandler } = require('./middleware/errorhandler');

// Routes
const authRoutes = require('./routes/auth');
const storyRoutes = require('./routes/stories');
const userRoutes = require('./routes/users');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(compression());
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', generalLimiter);

// 🎯 UPDATED: Enhanced CORS configuration with PATCH support
const corsOptions = {
  origin: config.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // ✅ Added PATCH and OPTIONS
  allowedHeaders: [
    'Content-Type', 
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control'
  ],
  exposedHeaders: ['X-Total-Count'], // Optional: expose custom headers to client
  optionsSuccessStatus: 200, // Support legacy browsers
  preflightContinue: false // Don't pass preflight to next handler
};

app.use(cors(corsOptions));

// 🎯 NEW: Handle preflight OPTIONS requests explicitly
app.options('*', cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 🎯 NEW: Debug middleware for CORS (development only)
if (config.nodeEnv === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin || 'No Origin'}`);
    if (req.method === 'OPTIONS') {
      console.log('🔄 Preflight request detected');
    }
    next();
  });
}

// Route mounting
app.use('/api/auth', authRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/users', userRoutes);

// Base API info route
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to FailFixes API',
    version: '1.0.0',
    cors: {
      enabled: true,
      allowedOrigins: Array.isArray(config.cors.origin) ? config.cors.origin : [config.cors.origin],
      allowedMethods: corsOptions.methods
    }
  });
});

// 🎯 UPDATED: Enhanced health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    message: 'FailFixes API is running! 🚀',
    timestamp: new Date().toISOString(),
    cors: {
      enabled: true,
      allowedMethods: corsOptions.methods,
      allowedHeaders: corsOptions.allowedHeaders
    },
    environment: config.nodeEnv || 'development'
  });
});

// 🎯 NEW: CORS test endpoint for debugging
app.get('/api/cors-test', (req, res) => {
  res.json({
    success: true,
    message: 'CORS is working correctly!',
    origin: req.headers.origin || 'No origin header',
    method: req.method,
    headers: {
      'access-control-allow-origin': res.getHeader('Access-Control-Allow-Origin'),
      'access-control-allow-methods': res.getHeader('Access-Control-Allow-Methods'),
      'access-control-allow-headers': res.getHeader('Access-Control-Allow-Headers')
    }
  });
});

// 404 handler for other routes not matched
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handler middleware
app.use(errorHandler);

module.exports = app;
