const mongoose = require('mongoose');

// 🎯 NEW: Comment schema for embedded comments
const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Comment must have an author']
  },
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    minlength: [1, 'Comment cannot be empty'],
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const storySchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Story title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
    minlength: [10, 'Title must be at least 10 characters']
  },
  content: { 
    type: String, 
    required: [true, 'Story content is required'],
    minlength: [100, 'Story content must be at least 100 characters']
  },
  excerpt: { 
    type: String, 
    maxlength: [500, 'Excerpt cannot exceed 500 characters'] 
  },
  slug: { 
    type: String, 
    unique: true, 
    lowercase: true,
    sparse: true
  },
  category: { 
    type: String, 
    required: [true, 'Story category is required'],
    enum: {
      values: ['business', 'personal', 'education', 'health', 'relationships', 'career', 'technology', 'creative'],
      message: '{VALUE} is not a valid category'
    }
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'Story must have an author']
  },
  status: { 
    type: String, 
    enum: ['draft', 'published', 'archived'], 
    default: 'published' 
  },
  featured: { type: Boolean, default: false },
  trending: { type: Boolean, default: false },
  
  // 🎯 NEW: Comments array with embedded schema
  comments: [commentSchema],
  
  // 🎯 NEW: Likes array referencing users
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // 🎯 UPDATED: Enhanced stats object
  stats: {
    views: { type: Number, default: 0, min: 0 },
    likes: { type: Number, default: 0, min: 0 },
    shares: { type: Number, default: 0, min: 0 },
    comments: { type: Number, default: 0, min: 0 },
    bookmarks: { type: Number, default: 0, min: 0 }
  },
  
  metadata: {
    failureType: {
      type: String,
      enum: ['startup', 'career', 'relationship', 'health', 'education', 'financial', 'creative', 'other']
    },
    recoveryTime: { 
      type: String, 
      maxlength: [100, 'Recovery time cannot exceed 100 characters'] 
    },
    keyLessons: [{ 
      type: String, 
      maxlength: [500, 'Key lesson cannot exceed 500 characters'] 
    }],
    currentStatus: {
      type: String,
      enum: ['recovering', 'recovered', 'thriving', 'helping_others']
    },
    readTime: { type: Number, default: 1, min: 1 }
  },
  publishedAt: { type: Date, default: null },
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 🎯 UPDATED: Enhanced indexes for performance
storySchema.index({ author: 1, createdAt: -1 });
storySchema.index({ category: 1, status: 1 });
storySchema.index({ tags: 1 });
storySchema.index({ 'stats.views': -1 });
storySchema.index({ 'stats.likes': -1 });
storySchema.index({ 'stats.comments': -1 }); // NEW
storySchema.index({ slug: 1 });
storySchema.index({ publishedAt: -1 });
storySchema.index({ featured: 1, 'stats.views': -1 }); // NEW
storySchema.index({ trending: 1, 'stats.likes': -1 }); // NEW
storySchema.index({ likes: 1 }); // NEW: Index on likes array

// Text search index
storySchema.index({
  title: 'text',
  content: 'text',
  tags: 'text',
  'metadata.keyLessons': 'text'
});

// 🎯 NEW: Virtual for checking if user liked the story
storySchema.virtual('isLikedBy').get(function() {
  return (userId) => this.likes.includes(userId);
});

// 🎯 NEW: Virtual for getting recent comments
storySchema.virtual('recentComments').get(function() {
  return this.comments
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 3);
});

// 🎯 UPDATED: Enhanced pre-save middleware
storySchema.pre('save', function(next) {
  // Generate slug from title
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Math.random().toString(36).substring(2, 8);
  }
  
  // Generate excerpt if not provided
  if (!this.excerpt && this.content) {
    this.excerpt = this.content.substring(0, 200) + '...';
  }
  
  // Calculate read time
  if (this.content) {
    const wordsPerMinute = 200;
    const wordCount = this.content.trim().split(/\s+/).length;
    this.metadata.readTime = Math.ceil(wordCount / wordsPerMinute) || 1;
  }
  
  // Set published date
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  // 🎯 NEW: Update stats counts based on arrays
  if (this.isModified('likes')) {
    this.stats.likes = this.likes.length;
  }
  
  if (this.isModified('comments')) {
    this.stats.comments = this.comments.length;
  }
  
  next();
});

// 🎯 NEW: Instance method to check if user liked the story
storySchema.methods.isLikedByUser = function(userId) {
  return this.likes.some(likeId => likeId.toString() === userId.toString());
};

// 🎯 NEW: Instance method to add like
storySchema.methods.toggleLike = function(userId) {
  const likeIndex = this.likes.findIndex(likeId => likeId.toString() === userId.toString());
  
  if (likeIndex === -1) {
    // Add like
    this.likes.push(userId);
    return true; // liked
  } else {
    // Remove like
    this.likes.splice(likeIndex, 1);
    return false; // unliked
  }
};

// 🎯 NEW: Instance method to add comment
storySchema.methods.addComment = function(userId, content) {
  const comment = {
    user: userId,
    content: content.trim(),
    createdAt: new Date()
  };
  
  this.comments.push(comment);
  return comment;
};

// 🎯 NEW: Instance method to increment views
storySchema.methods.incrementViews = function() {
  this.stats.views += 1;
  return this.save();
};

// 🎯 NEW: Static method to find trending stories
storySchema.statics.findTrending = function(limit = 10) {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  return this.find({
    createdAt: { $gte: oneWeekAgo },
    status: 'published',
    moderationStatus: 'approved'
  })
  .sort({ 'stats.likes': -1, 'stats.views': -1 })
  .limit(limit)
  .populate('author', 'name username avatar');
};

// 🎯 NEW: Static method to find most liked stories
storySchema.statics.findMostLiked = function(limit = 10) {
  return this.find({
    status: 'published',
    moderationStatus: 'approved'
  })
  .sort({ 'stats.likes': -1, 'stats.views': -1 })
  .limit(limit)
  .populate('author', 'name username avatar');
};

// 🎯 NEW: Static method to find stories by category with stats
storySchema.statics.findByCategory = function(category, sortBy = 'recent', limit = 10) {
  const query = {
    category,
    status: 'published',
    moderationStatus: 'approved'
  };
  
  let sortOptions = {};
  switch (sortBy) {
    case 'popular':
      sortOptions = { 'stats.likes': -1, 'stats.views': -1 };
      break;
    case 'views':
      sortOptions = { 'stats.views': -1 };
      break;
    case 'recent':
    default:
      sortOptions = { publishedAt: -1, createdAt: -1 };
      break;
  }
  
  return this.find(query)
    .sort(sortOptions)
    .limit(limit)
    .populate('author', 'name username avatar');
};

module.exports = mongoose.model('Story', storySchema);
