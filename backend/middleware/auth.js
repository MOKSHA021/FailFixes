const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  console.log('\n🔐 AUTH MIDDLEWARE');
  
  try {
    const authHeader = req.header('Authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader) {
      console.error('❌ No Authorization header found');
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided',
        code: 'NO_TOKEN'
      });
    }

    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      console.error('❌ No token in Authorization header');
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token format',
        code: 'INVALID_TOKEN_FORMAT'
      });
    }

    console.log('✅ Token found, length:', token.length);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token verified, user ID:', decoded.id);

    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      console.error('❌ User not found for token:', decoded.id);
      return res.status(401).json({ 
        success: false, 
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    console.log('✅ User authenticated:', {
      id: user._id.toString(),
      name: user.name,
      username: user.username
    });
    console.log('=== END AUTH MIDDLEWARE ===\n');

    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Auth error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Authentication error',
      code: 'AUTH_ERROR'
    });
  }
};

const optionalAuth = async (req, res, next) => {
  console.log('\n🔓 === OPTIONAL AUTH MIDDLEWARE ===');
  
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      console.log('No auth header - proceeding without authentication');
      return next();
    }

    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      console.log('No token - proceeding without authentication');
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (user) {
      console.log('✅ Optional auth successful:', user.name);
      req.user = user;
    }

    console.log('=== END OPTIONAL AUTH ===\n');
    next();
  } catch (error) {
    console.log('Optional auth failed - proceeding without auth:', error.message);
    next();
  }
};

// ✅ FIXED: Export both `auth` and `protect` (they're the same function)
module.exports = { 
  auth, 
  protect: auth,  // ← ADD THIS LINE
  optionalAuth 
};
