const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email',
      ],
    },
    
    username: {
      type: String,
      unique: true,
      sparse: true, // ⭐ CRITICAL: Allows multiple null/undefined values
      lowercase: true,
      trim: true,
      validate: {
        validator: function(v) {
          // Allow empty/null values
          if (v == null || v === '') return true;
          // Validate only if value exists
          return /^[a-zA-Z0-9_]+$/.test(v) && v.length >= 3 && v.length <= 20;
        },
        message: 'Username must be 3-20 characters and contain only letters, numbers, and underscores'
      }
    },
    
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // ⭐ Don't return password by default
    },
    
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: '',
    },
    
    location: {
      type: String,
      maxlength: [100, 'Location cannot exceed 100 characters'],
      default: '',
    },
    
    website: {
      type: String,
      maxlength: [200, 'Website URL cannot exceed 200 characters'],
      default: '',
    },
    
    avatar: {
      type: String,
      default: '',
    },
    
    isActive: {
      type: Boolean,
      default: true,
    },
    
    isVerified: {
      type: Boolean,
      default: false,
    },
    
    emailVerificationToken: {
      type: String,
      default: null,
    },
    
    emailVerificationExpires: {
      type: Date,
      default: null,
    },
    
    allowAnonymous: {
      type: Boolean,
      default: false,
    },
    
    role: {
      type: String,
      enum: ['user', 'moderator', 'admin'],
      default: 'user',
    },
    
    stats: {
      storiesCount: { type: Number, default: 0 },
      totalViews: { type: Number, default: 0 },
      totalLikes: { type: Number, default: 0 },
      totalComments: { type: Number, default: 0 },
      followersCount: { type: Number, default: 0 },
      followingCount: { type: Number, default: 0 },
    },
    
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      profileVisibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'public',
      },
      showEmail: { type: Boolean, default: false },
    },
    
    lastLogin: { type: Date, default: null },
    loginCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { 
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
      }
    },
  }
);

// ========== VIRTUALS ==========
userSchema.virtual('displayUsername').get(function () {
  return this.username || this.name || `user_${this._id.toString().slice(-6)}`;
});

userSchema.virtual('fullDisplayName').get(function () {
  return this.name + (this.username ? ` (@${this.username})` : '');
});

userSchema.virtual('isFollowable').get(function () {
  return this.preferences.profileVisibility === 'public';
});

// ========== INDEXES ==========
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ name: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ 'stats.followersCount': -1 });
userSchema.index({ followers: 1 });
userSchema.index({ following: 1 });

// ========== PRE-SAVE MIDDLEWARE ==========
userSchema.pre('save', async function (next) {
  try {
    // ✅ Hash password if modified (with enhanced logging)
    if (this.isModified('password')) {
      console.log('🔒 Hashing password for user:', this.email);
      
      // Validate password exists
      if (!this.password || this.password.length === 0) {
        throw new Error('Password cannot be empty');
      }

      // Check if password is already hashed (starts with $2a$ or $2b$)
      if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
        console.log('⚠️ Password already hashed, skipping...');
        return next();
      }

      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(this.password, salt);
      
      console.log('✅ Password hashed successfully:', {
        email: this.email,
        originalLength: this.password.length,
        hashedLength: hashedPassword.length,
        hashedPrefix: hashedPassword.substring(0, 10)
      });
      
      this.password = hashedPassword;
    }

    // Update follower/following counts
    if (this.isModified('followers')) {
      this.stats.followersCount = this.followers.length;
    }
    if (this.isModified('following')) {
      this.stats.followingCount = this.following.length;
    }

    next();
  } catch (error) {
    console.error('❌ Error in pre-save middleware:', error);
    next(error);
  }
});

// ========== INSTANCE METHODS ==========

/**
 * ✅ Compare password with hashed password
 * @param {string} candidatePassword - Plain text password to compare
 * @returns {Promise<boolean>} - True if passwords match
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    console.log('🔍 Comparing password for user:', this.email);
    
    // Validate inputs
    if (!candidatePassword) {
      console.log('❌ No candidate password provided');
      return false;
    }

    if (!this.password) {
      console.log('❌ No stored password found for user');
      return false;
    }

    // Check if stored password is hashed
    if (!this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) {
      console.log('❌ Stored password is not hashed properly');
      return false;
    }

    console.log('🔒 Password comparison details:', {
      candidateLength: candidatePassword.length,
      storedPasswordPrefix: this.password.substring(0, 10),
      storedPasswordLength: this.password.length
    });

    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    
    console.log('🔍 Password comparison result:', isMatch ? '✅ MATCH' : '❌ NO MATCH');
    
    return isMatch;
  } catch (error) {
    console.error('❌ Error comparing password:', error);
    return false;
  }
};

/**
 * ✅ Generate JWT authentication token
 * @returns {string} - JWT token
 */
userSchema.methods.generateAuthToken = function () {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const payload = {
      id: this._id,
      email: this.email,
      username: this.username || this.name,
      role: this.role,
      displayUsername: this.displayUsername,
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    console.log('🎟️ JWT token generated for user:', this.email);

    return token;
  } catch (error) {
    console.error('❌ Error generating auth token:', error);
    throw error;
  }
};

/**
 * Check if user is following another user
 * @param {ObjectId} userId - User ID to check
 * @returns {boolean}
 */
userSchema.methods.isFollowing = function (userId) {
  return this.following.some(
    (followId) => followId.toString() === userId.toString()
  );
};

/**
 * Check if user has a follower
 * @param {ObjectId} userId - User ID to check
 * @returns {boolean}
 */
userSchema.methods.hasFollower = function (userId) {
  return this.followers.some(
    (followId) => followId.toString() === userId.toString()
  );
};

/**
 * Follow another user
 * @param {ObjectId} userId - User ID to follow
 */
userSchema.methods.follow = function (userId) {
  if (!this.isFollowing(userId)) {
    this.following.push(userId);
    this.stats.followingCount = this.following.length;
  }
};

/**
 * Unfollow a user
 * @param {ObjectId} userId - User ID to unfollow
 */
userSchema.methods.unfollow = function (userId) {
  const index = this.following.findIndex(
    (followId) => followId.toString() === userId.toString()
  );
  if (index > -1) {
    this.following.splice(index, 1);
    this.stats.followingCount = this.following.length;
  }
};

/**
 * Add a follower
 * @param {ObjectId} userId - User ID to add as follower
 */
userSchema.methods.addFollower = function (userId) {
  if (!this.hasFollower(userId)) {
    this.followers.push(userId);
    this.stats.followersCount = this.followers.length;
  }
};

/**
 * Remove a follower
 * @param {ObjectId} userId - User ID to remove from followers
 */
userSchema.methods.removeFollower = function (userId) {
  const index = this.followers.findIndex(
    (followId) => followId.toString() === userId.toString()
  );
  if (index > -1) {
    this.followers.splice(index, 1);
    this.stats.followersCount = this.followers.length;
  }
};

// ========== STATIC METHODS ==========

/**
 * Find user by username or name
 * @param {string} username - Username to search for
 * @returns {Promise<User>}
 */
userSchema.statics.findByUsername = function (username) {
  return this.findOne({
    $or: [
      { username: username.toLowerCase() }, 
      { name: username }
    ],
  });
};

/**
 * Find suggested users for a given user
 * @param {ObjectId} currentUserId - Current user's ID
 * @param {number} limit - Number of users to return
 * @returns {Promise<Array>}
 */
userSchema.statics.findSuggestedUsers = function (currentUserId, limit = 5) {
  return this.find({
    _id: { $ne: currentUserId },
    isActive: true,
    'preferences.profileVisibility': 'public',
  })
    .sort({ 'stats.followersCount': -1, createdAt: -1 })
    .limit(limit)
    .select('name username bio avatar stats');
};

/**
 * ✅ Find user by email or username (for login)
 * @param {string} identifier - Email or username
 * @returns {Promise<User>}
 */
userSchema.statics.findByIdentifier = function (identifier) {
  const trimmedIdentifier = identifier.trim().toLowerCase();
  
  return this.findOne({
    $or: [
      { email: trimmedIdentifier },
      { username: trimmedIdentifier }
    ],
  }).select('+password'); // Include password for login
};

/**
 * ✅ Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - Validation result
 */
userSchema.statics.validatePassword = function (password) {
  const errors = [];
  
  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  
  if (password && password.length > 128) {
    errors.push('Password is too long');
  }
  
  // Optional: Add more strength requirements
  // if (!/[A-Z]/.test(password)) errors.push('Password must contain uppercase letter');
  // if (!/[a-z]/.test(password)) errors.push('Password must contain lowercase letter');
  // if (!/[0-9]/.test(password)) errors.push('Password must contain number');
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// ========== DEBUGGING HELPER ==========
/**
 * ✅ Debug method to check user password status
 */
userSchema.methods.debugPassword = function () {
  return {
    email: this.email,
    hasPassword: !!this.password,
    passwordLength: this.password?.length || 0,
    isHashed: this.password?.startsWith('$2') || false,
    passwordPrefix: this.password?.substring(0, 10) || 'NO_PASSWORD'
  };
};

module.exports = mongoose.model('User', userSchema);
