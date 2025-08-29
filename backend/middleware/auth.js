const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - require valid JWT token
exports.auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No valid token provided.' 
      });
    }
    
    const token = authHeader.substring(7);
    console.log('Auth middleware: Token received, length:', token.length);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Auth middleware: Token decoded successfully for user ID:', decoded.id);
      
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user || !user.isActive) {
        console.log('Auth middleware: User not found or inactive');
        return res.status(401).json({ 
          success: false, 
          message: 'Access denied. Invalid or inactive user.' 
        });
      }
      
      console.log('Auth middleware: User authenticated:', user.username);
      req.user = user;
      next();
    } catch (jwtError) {
      console.error('Auth middleware: JWT verification error:', jwtError.message);
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. Invalid token.' 
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error in authentication' 
    });
  }
};

// Optional auth - doesn't require token but adds user if valid
exports.optionalAuth = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      // Continue without user
      console.log('Optional auth: Invalid token, continuing without user');
    }
  }
  
  next();
};
