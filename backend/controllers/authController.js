const User = require('../models/User');

// ========== REGISTER ==========
// @desc    Register user (signup)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;

    console.log('📝 Signup attempt:', { 
      name, 
      email, 
      username: username || 'NOT_PROVIDED' 
    });

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingEmail) {
      console.log('❌ Email already registered:', email);
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Check if username already exists (only if provided)
    if (username && username.trim()) {
      const existingUsername = await User.findOne({ 
        username: username.trim().toLowerCase() 
      });
      if (existingUsername) {
        console.log('❌ Username already taken:', username);
        return res.status(400).json({
          success: false,
          message: 'Username already taken'
        });
      }
    }

    // Build user data
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      isVerified: true,
      allowAnonymous: false
    };

    // Add username only if provided and not empty
    if (username && username.trim()) {
      userData.username = username.trim().toLowerCase();
    }

    // Create and save user
    const user = new User(userData);
    await user.save();

    console.log('✅ User created:', {
      id: user._id,
      email: user.email,
      username: user.username || 'NO_USERNAME'
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully. You can now log in.'
    });

  } catch (error) {
    console.error('❌ SIGNUP ERROR:', error.message);

    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `User with this ${field} already exists`
      });
    }

    // Handle validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0] || 'Validation error'
      });
    }

    // General server error
    res.status(500).json({
      success: false,
      message: 'Server error during signup. Please try again.',
      ...(process.env.NODE_ENV === 'development' && {
        error: error.message
      })
    });
  }
};

// Alias for backward compatibility
exports.signup = exports.register;

// ========== LOGIN (FIXED) ==========
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    console.log('🔐 Login attempt for identifier:', identifier);

    // Validate input
    if (!identifier || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({
        success: false,
        message: 'Email/username and password are required'
      });
    }

    const trimmedIdentifier = identifier.trim().toLowerCase();
    console.log('🔍 Searching for user with:', trimmedIdentifier);

    // ✅ FIX: Find user by email OR username (handling null username)
    const user = await User.findOne({
      $or: [
        { email: trimmedIdentifier },
        { username: trimmedIdentifier },
        // Handle cases where username might be null/undefined
        ...(trimmedIdentifier.includes('@') ? [] : [{ name: trimmedIdentifier }])
      ]
    }).select('+password');

    console.log('🔍 User search result:', {
      found: !!user,
      email: user?.email,
      username: user?.username || 'NO_USERNAME',
      hasPassword: !!user?.password
    });

    if (!user) {
      console.log('❌ User not found for identifier:', trimmedIdentifier);
      return res.status(401).json({
        success: false,
        message: 'Invalid email/username or password'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      console.log('❌ Account deactivated:', user.username || user.email);
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // ✅ FIX: Verify password with better error handling
    console.log('🔒 Verifying password...');
    
    if (!user.password) {
      console.log('❌ User has no password set:', user.email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email/username or password'
      });
    }

    const isMatch = await user.comparePassword(password);
    console.log('🔒 Password match result:', isMatch);

    if (!isMatch) {
      console.log('❌ Invalid password for user:', user.username || user.email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email/username or password'
      });
    }

    // ✅ Generate JWT token
    console.log('🎟️ Generating auth token...');
    const token = user.generateAuthToken();

    // Update login stats
    await User.findByIdAndUpdate(
      user._id,
      {
        $set: { lastLogin: new Date() },
        $inc: { loginCount: 1 }
      },
      { runValidators: false }
    );

    // Prepare user data
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username || null,
      bio: user.bio || '',
      location: user.location || '',
      website: user.website || '',
      avatar: user.avatar || '',
      stats: user.stats,
      isVerified: user.isVerified,
      role: user.role,
      lastLogin: new Date(),
      createdAt: user.createdAt
    };

    console.log('✅ Login successful for:', user.username || user.email);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userData
    });

  } catch (error) {
    console.error('❌ LOGIN ERROR:', error);
    console.error('Error stack:', error.stack);

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

// ========== GET CURRENT USER ==========
// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username || null,
      bio: user.bio || '',
      location: user.location || '',
      website: user.website || '',
      avatar: user.avatar || '',
      stats: user.stats,
      isVerified: user.isVerified,
      role: user.role,
      preferences: user.preferences,
      createdAt: user.createdAt
    };

    res.json({
      success: true,
      user: userData
    });

  } catch (error) {
    console.error('❌ GET ME ERROR:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Error fetching user data'
    });
  }
};

// ========== LOGOUT ==========
// @desc    Logout user (client-side token deletion)
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    // Note: With JWT, logout is primarily client-side
    // Server can optionally track logged-out tokens in Redis/DB
    
    console.log('👋 User logged out:', req.user?.email || req.user?._id);

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('❌ LOGOUT ERROR:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Error during logout'
    });
  }
};

// ========== UPDATE PROFILE ==========
// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const allowedUpdates = ['name', 'bio', 'location', 'website', 'avatar'];
    const updates = {};

    // Filter allowed updates
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key) && req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    });

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ Profile updated for:', user.username || user.email);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        bio: user.bio,
        location: user.location,
        website: user.website,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error('❌ UPDATE PROFILE ERROR:', error.message);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0] || 'Validation error'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
};

// ========== CHANGE PASSWORD ==========
// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    console.log('✅ Password changed for:', user.username || user.email);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('❌ CHANGE PASSWORD ERROR:', error.message);

    res.status(500).json({
      success: false,
      message: 'Error changing password'
    });
  }
};
