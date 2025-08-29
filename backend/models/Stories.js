const mongoose = require('mongoose');

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
  stats: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    bookmarks: { type: Number, default: 0 }
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
    readTime: { type: Number, default: 1 }
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

// Indexes
storySchema.index({ author: 1, createdAt: -1 });
storySchema.index({ category: 1, status: 1 });
storySchema.index({ tags: 1 });
storySchema.index({ 'stats.views': -1 });
storySchema.index({ 'stats.likes': -1 });
storySchema.index({ slug: 1 });
storySchema.index({ publishedAt: -1 });

// Text search index
storySchema.index({
  title: 'text',
  content: 'text',
  tags: 'text',
  'metadata.keyLessons': 'text'
});

// Pre-save middleware
storySchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Math.random().toString(36).substring(2, 8);
  }
  
  if (!this.excerpt && this.content) {
    this.excerpt = this.content.substring(0, 200) + '...';
  }
  
  if (this.content) {
    const wordsPerMinute = 200;
    const wordCount = this.content.trim().split(/\s+/).length;
    this.metadata.readTime = Math.ceil(wordCount / wordsPerMinute) || 1;
  }
  
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

module.exports = mongoose.model('Story', storySchema);
