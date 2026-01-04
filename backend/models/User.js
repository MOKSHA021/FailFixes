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
      select: false,
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
        return ret;
      },
    },
    toObject: { virtuals: true },
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
  // Hash password if modified
  if (this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (err) {
      return next(err);
    }
  }

  // Update follower/following counts
  if (this.isModified('followers')) {
    this.stats.followersCount = this.followers.length;
  }
  if (this.isModified('following')) {
    this.stats.followingCount = this.following.length;
  }

  next();
});

// ========== INSTANCE METHODS ==========
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAuthToken = function () {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jwt.sign(
    {
      id: this._id,
      username: this.username || this.name,
      role: this.role,
      displayUsername: this.displayUsername,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

userSchema.methods.isFollowing = function (userId) {
  return this.following.some(
    (followId) => followId.toString() === userId.toString()
  );
};

userSchema.methods.hasFollower = function (userId) {
  return this.followers.some(
    (followId) => followId.toString() === userId.toString()
  );
};

userSchema.methods.follow = function (userId) {
  if (!this.isFollowing(userId)) {
    this.following.push(userId);
    this.stats.followingCount = this.following.length;
  }
};

userSchema.methods.unfollow = function (userId) {
  const index = this.following.findIndex(
    (followId) => followId.toString() === userId.toString()
  );
  if (index > -1) {
    this.following.splice(index, 1);
    this.stats.followingCount = this.following.length;
  }
};

userSchema.methods.addFollower = function (userId) {
  if (!this.hasFollower(userId)) {
    this.followers.push(userId);
    this.stats.followersCount = this.followers.length;
  }
};

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
userSchema.statics.findByUsername = function (username) {
  return this.findOne({
    $or: [{ username: username.toLowerCase() }, { name: username }],
  });
};

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

module.exports = mongoose.model('User', userSchema);
