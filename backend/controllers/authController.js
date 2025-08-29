const User = require('../models/User');

// @desc    Register user
// @route   POST /api/auth/signup & POST /api/auth/register
// @access  Public
exports.signup = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;

    console.log('Signup attempt for:', { name, email, username });

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'username';
      console.log(`User already exists with ${field}:`, existingUser[field]);
      return res.status(400).json({
        success: false,
        message: `User with this ${field} already exists`
      });
    }

    // Create user
    const user = new User({ name, email, username, password });
    await user.save();

    // Generate token
    const token = user.generateAuthToken();

    // Update login stats WITHOUT triggering validation
    await User.findByIdAndUpdate(user._id, {
      $set: { lastLogin: new Date() },
      $inc: { loginCount: 1 }
    }, {
      runValidators: false  // This prevents validation errors
    });

    // Return user data with fallbacks
    const userData = {
      id: user._id,
      name: user.name || user.username || '',
      email: user.email,
      username: user.username,
      bio: user.bio || '',
      location: user.location || '',
      website: user.website || '',
      stats: user.stats || {
        storiesCount: 0,
        totalViews: 0,
        totalLikes: 0,
        followersCount: 0,
        followingCount: 0
      },
      isVerified: user.isVerified || false,
      role: user.role || 'user',
      createdAt: user.createdAt
    };

    console.log('User created successfully:', user.username);

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to FailFixes!',
      token,
      user: userData
    });
  } catch (error) {
    console.error('=== SIGNUP ERROR ===');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('====================');
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `User with this ${field} already exists`
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error during signup. Please try again.',
      ...(process.env.NODE_ENV === 'development' && { 
        error: error.message,
        stack: error.stack 
      })
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Validate input
    if (!identifier || !password) {
      console.log('Missing credentials in login attempt');
      return res.status(400).json({
        success: false,
        message: 'Please provide email/username and password'
      });
    }

    console.log('=== LOGIN ATTEMPT ===');
    console.log('Identifier:', identifier);

    // Find user and EXPLICITLY select password field
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier.toLowerCase() }
      ]
    }).select('+password');

    if (!user) {
      console.log('Login failed: User not found for identifier:', identifier);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    if (!user.isActive) {
      console.log('Login failed: User account is deactivated:', user.username);
      return res.status(403).json({ 
        success: false, 
        message: 'Account is deactivated' 
      });
    }

    // Compare password
    console.log('Comparing passwords...');
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      console.log('Login failed: Invalid password for user:', user.username);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Generate token
    console.log('Generating authentication token...');
    const token = user.generateAuthToken();

    // Update login stats WITHOUT triggering validation
    await User.findByIdAndUpdate(
      user._id, 
      { 
        $set: { lastLogin: new Date() },
        $inc: { loginCount: 1 }
      },
      { 
        runValidators: false  // This prevents validation errors!
      }
    );

    // Return user data with fallbacks for missing fields
    const userData = {
      id: user._id,
      name: user.name || user.username || '', // Fallback if name is missing
      email: user.email,
      username: user.username,
      bio: user.bio || '',
      location: user.location || '',
      website: user.website || '',
      stats: user.stats || {
        storiesCount: 0,
        totalViews: 0,
        totalLikes: 0,
        followersCount: 0,
        followingCount: 0
      },
      isVerified: user.isVerified || false,
      role: user.role || 'user',
      lastLogin: new Date()
    };

    console.log('=== LOGIN SUCCESS ===');
    console.log('User:', user.username);
    console.log('====================');

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userData
    });

  } catch (error) {
    console.error('=== LOGIN ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('===================');
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login. Please try again.',
      ...(process.env.NODE_ENV === 'development' && { 
        error: error.message,
        stack: error.stack 
      })
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const userData = {
      id: req.user._id,
      name: req.user.name || req.user.username || '', // Fallback if name is missing
      email: req.user.email,
      username: req.user.username,
      bio: req.user.bio || '',
      location: req.user.location || '',
      website: req.user.website || '',
      stats: req.user.stats || {
        storiesCount: 0,
        totalViews: 0,
        totalLikes: 0,
        followersCount: 0,
        followingCount: 0
      },
      isVerified: req.user.isVerified || false,
      role: req.user.role || 'user',
      preferences: req.user.preferences || {},
      createdAt: req.user.createdAt
    };

    res.json({
      success: true,
      user: userData
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching user data' 
    });
  }
};
