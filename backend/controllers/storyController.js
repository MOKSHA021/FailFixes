/* eslint-disable no-console */
const Story = require('../models/Story');
const User  = require('../models/User');

/* ─────────────────────────────────────────────────────────────
   GET  /api/stories   →  list stories with filters
   Public
────────────────────────────────────────────────────────────── */
exports.getAllStories = async (req, res) => {
  try {
    const {
      category,
      search,
      sortBy = 'recent',
      page   = 1,
      limit  = 9
    } = req.query;

    console.log('Fetching stories with filters:', { category, search, sortBy, page, limit });

    const query = {};

    /* category */
    if (category && category !== 'all') query.category = category;

    /* 🎯 UPDATED: Search only in title with partial match */
    if (search && search.trim()) {
      query.title = { 
        $regex: search.trim(), 
        $options: 'i'
      };
    }

    /* sorting */
    let sortOptions = {};
    switch (sortBy) {
      case 'popular':
        sortOptions = { 'stats.likes': -1, 'stats.views': -1 };
        break;
      case 'views':
        sortOptions = { 'stats.views': -1 };
        break;
      case 'trending': {
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        query.createdAt  = { $gte: oneWeekAgo };
        sortOptions      = { 'stats.views': -1, 'stats.likes': -1 };
        break;
      }
      case 'recent':
      default:
        sortOptions = { publishedAt: -1, createdAt: -1 };
        break;
    }

    const pageNum  = parseInt(page,  10);
    const limitNum = parseInt(limit, 10);

    // 🎯 UPDATED: Include isLiked for authenticated users
    const [stories, total] = await Promise.all([
      Story.find(query)
           .populate('author', 'name username bio location stats')
           .sort(sortOptions)
           .limit(limitNum)
           .skip((pageNum - 1) * limitNum)
           .lean(),
      Story.countDocuments(query)
    ]);

    console.log(`Found ${stories.length} stories out of ${total} total`);

    /* add read-time + publishedAt helper fields + user like status */
    const storiesWithMeta = stories.map(s => ({
      ...s,
      readTime   : s.metadata?.readTime || Math.ceil(s.content.split(' ').length / 200),
      publishedAt: s.publishedAt || s.createdAt,
      isLiked    : req.user ? s.likes.some(like => like.toString() === req.user._id.toString()) : false
    }));

    res.json({
      success   : true,
      stories   : storiesWithMeta,
      pagination: {
        currentPage : pageNum,
        totalPages  : Math.ceil(total / limitNum),
        totalStories: total,
        hasNext     : pageNum < Math.ceil(total / limitNum),
        hasPrev     : pageNum > 1,
        limit       : limitNum
      },
      filters: { category: category || 'all', search: search || '', sortBy }
    });
  } catch (err) {
    console.error('Get stories error:', err);
    res.status(500).json({ success: false, message: 'Error fetching stories' });
  }
};

/* ─────────────────────────────────────────────────────────────
   POST /api/stories   →  create story
   Private
────────────────────────────────────────────────────────────── */
exports.createStory = async (req, res) => {
  try {
    const {
      title,
      content,
      category,
      tags = [],
      status = 'published',
      metadata = {}
    } = req.body;

    console.log('Creating story:', { title, category, status, authorId: req.user._id });

    /* sanitize metadata */
    const cleanMeta = {};
    if (metadata.failureType)  cleanMeta.failureType  = metadata.failureType;
    if (metadata.recoveryTime) cleanMeta.recoveryTime = metadata.recoveryTime;
    if (Array.isArray(metadata.keyLessons) && metadata.keyLessons.filter(Boolean).length) {
      cleanMeta.keyLessons = metadata.keyLessons.filter(Boolean);
    }
    if (metadata.currentStatus) cleanMeta.currentStatus = metadata.currentStatus;
    if (metadata.readTime)      cleanMeta.readTime      = metadata.readTime;

    const story = new Story({
      title,
      content,
      category,
      tags   : tags.map(t => t.toLowerCase().trim()).slice(0, 5),
      author : req.user._id,
      status,
      metadata: cleanMeta
    });

    await story.save();
    await story.populate('author', 'name username bio location');

    /* bump author stats if published */
    if (status === 'published') {
      await User.findByIdAndUpdate(req.user._id, { $inc: { 'stats.storiesCount': 1 } });
      console.log('Updated user story count for', req.user.username);
    }

    console.log('Story created:', story._id);

    res.status(201).json({
      success : true,
      message : status === 'published'
        ? 'Story published successfully!'
        : 'Story saved as draft!',
      story
    });
  } catch (err) {
    console.error('Create story error:', err);
    res.status(500).json({ success: false, message: 'Error creating story' });
  }
};

/* ─────────────────────────────────────────────────────────────
   🎯 UPDATED: GET /api/stories/:id   →  single story with proper view increment
   Public
────────────────────────────────────────────────────────────── */
exports.getStoryById = async (req, res) => {
  try {
    console.log('Fetching story by ID:', req.params.id);

    // First, get the story without incrementing views
    let story = await Story.findById(req.params.id)
      .populate('author', 'name username bio location website stats isVerified')
      .populate('comments.user', 'name username avatar');

    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    const isOwner = req.user && story.author._id.toString() === req.user._id.toString();
    const isPublished = story.status === 'published' && story.moderationStatus === 'approved';

    if (!isPublished && !isOwner) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    // 🎯 FIXED: Increment views atomically and get updated document
    if (!isOwner && isPublished) {
      console.log(`Incrementing views for story ${req.params.id} (current: ${story.stats.views})`);
      
      // Atomically increment views and get updated document
      const updatedStory = await Story.findByIdAndUpdate(
        req.params.id,
        { $inc: { 'stats.views': 1 } },
        { new: true } // Return updated document
      ).populate('author', 'name username bio location website stats isVerified')
       .populate('comments.user', 'name username avatar');

      // Also update user's total views count
      await User.findByIdAndUpdate(story.author._id, { $inc: { 'stats.totalViews': 1 } });

      // Use the updated story
      story = updatedStory;
      
      console.log(`Views updated to: ${story.stats.views}`);
    }

    // 🎯 Check if current user liked the story
    const isLiked = req.user ? story.likes.some(like => like.toString() === req.user._id.toString()) : false;

    res.json({
      success: true,
      story  : {
        ...story.toObject(),
        readTime: story.metadata?.readTime || Math.ceil(story.content.split(' ').length / 200),
        isLiked // Include user's like status
      }
    });
  } catch (err) {
    console.error('Get story error:', err);
    res.status(500).json({ success: false, message: 'Error fetching story' });
  }
};

/* ─────────────────────────────────────────────────────────────
   PUT /api/stories/:id   →  update
   Private
────────────────────────────────────────────────────────────── */
exports.updateStory = async (req, res) => {
  try {
    const { title, content, category, tags, status, metadata } = req.body;

    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ success: false, message: 'Story not found' });

    if (story.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update' });
    }

    if (title)    story.title    = title;
    if (content)  story.content  = content;
    if (category) story.category = category;
    if (tags)     story.tags     = tags.map(t => t.toLowerCase().trim()).slice(0, 5);
    if (status)   story.status   = status;
    if (metadata) {
      const cleanMeta = { ...story.metadata, ...metadata };
      Object.keys(cleanMeta).forEach(k => { if (cleanMeta[k] === '') delete cleanMeta[k]; });
      story.metadata = cleanMeta;
    }

    await story.save();
    await story.populate('author', 'name username bio location');

    res.json({ success: true, message: 'Story updated successfully!', story });
  } catch (err) {
    console.error('Update story error:', err);
    res.status(500).json({ success: false, message: 'Error updating story' });
  }
};

/* ─────────────────────────────────────────────────────────────
   DELETE /api/stories/:id   →  delete
   Private
────────────────────────────────────────────────────────────── */
exports.deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ success: false, message: 'Story not found' });

    if (story.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete' });
    }

    await Story.findByIdAndDelete(req.params.id);
    await User.findByIdAndUpdate(req.user._id, { $inc: { 'stats.storiesCount': -1 } });

    res.json({ success: true, message: 'Story deleted successfully!' });
  } catch (err) {
    console.error('Delete story error:', err);
    res.status(500).json({ success: false, message: 'Error deleting story' });
  }
};

/* ─────────────────────────────────────────────────────────────
   🎯 PATCH /api/stories/:id/like   →  toggle like/unlike
   Private
────────────────────────────────────────────────────────────── */
exports.likeStory = async (req, res) => {
  try {
    const userId = req.user._id;
    const storyId = req.params.id;

    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    const likeIndex = story.likes.findIndex(id => id.toString() === userId.toString());
    let isLiked;
    let message;

    if (likeIndex === -1) {
      // Add like
      story.likes.push(userId);
      isLiked = true;
      message = 'Story liked';
    } else {
      // Remove like
      story.likes.splice(likeIndex, 1);
      isLiked = false;
      message = 'Like removed';
    }

    story.stats.likes = story.likes.length;
    await story.save();

    console.log(`User ${req.user.username} ${isLiked ? 'liked' : 'unliked'} story ${storyId}`);

    res.json({
      success: true,
      message,
      isLiked,
      likesCount: story.stats.likes
    });
  } catch (err) {
    console.error('Like story error:', err);
    res.status(500).json({ success: false, message: 'Error toggling like' });
  }
};

/* ─────────────────────────────────────────────────────────────
   🎯 POST /api/stories/:id/comment   →  add comment
   Private
────────────────────────────────────────────────────────────── */
exports.addComment = async (req, res) => {
  try {
    const userId = req.user._id;
    const storyId = req.params.id;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Comment content is required' });
    }

    if (content.length > 500) {
      return res.status(400).json({ success: false, message: 'Comment must be 500 characters or less' });
    }

    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    const comment = {
      user: userId,
      content: content.trim(),
      createdAt: new Date()
    };

    story.comments.push(comment);
    story.stats.comments = story.comments.length;
    await story.save();

    // Get the populated comment
    await story.populate('comments.user', 'name username avatar');
    const newComment = story.comments[story.comments.length - 1];

    console.log(`User ${req.user.username} commented on story ${storyId}`);

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: newComment,
      commentsCount: story.stats.comments
    });
  } catch (err) {
    console.error('Add comment error:', err);
    res.status(500).json({ success: false, message: 'Error adding comment' });
  }
};

/* ─────────────────────────────────────────────────────────────
   🎯 GET /api/stories/:id/comments   →  get comments with pagination
   Public
────────────────────────────────────────────────────────────── */
exports.getComments = async (req, res) => {
  try {
    const storyId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const story = await Story.findById(storyId).populate('comments.user', 'name username avatar');
    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    const totalComments = story.comments.length;
    const totalPages = Math.ceil(totalComments / limit);
    
    // Sort comments by newest first and paginate
    const sortedComments = story.comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedComments = sortedComments.slice(startIndex, endIndex);

    res.json({
      success: true,
      comments: paginatedComments,
      pagination: {
        currentPage: page,
        totalPages,
        totalComments,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        limit
      }
    });
  } catch (err) {
    console.error('Get comments error:', err);
    res.status(500).json({ success: false, message: 'Error fetching comments' });
  }
};

/* ─────────────────────────────────────────────────────────────
   🎯 NEW: PATCH /api/stories/:id/view   →  increment view count
   Public (alternative method for manual view tracking)
────────────────────────────────────────────────────────────── */
exports.incrementView = async (req, res) => {
  try {
    const story = await Story.findByIdAndUpdate(
      req.params.id,
      { $inc: { 'stats.views': 1 } },
      { new: true }
    );

    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    // Update author's total views
    await User.findByIdAndUpdate(story.author, { $inc: { 'stats.totalViews': 1 } });

    console.log(`Story ${req.params.id} views incremented to: ${story.stats.views}`);

    res.json({
      success: true,
      message: 'View count updated',
      views: story.stats.views
    });
  } catch (err) {
    console.error('Increment view error:', err);
    res.status(500).json({ success: false, message: 'Error updating views' });
  }
};
