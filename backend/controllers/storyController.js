const Story = require('../models/Story');
const User = require('../models/User');
const mongoose = require('mongoose');

const userViewCounts = new Map();

// ✅ FIXED: Export getAllStories (matching your routes)
exports.getAllStories = async (req, res) => {
  try {
    const {
      category,
      search,
      sortBy = 'recent',
      page = 1,
      limit = 9,
      authorUsername
    } = req.query;

    const query = { status: 'published' };

    if (category && category !== 'all') query.category = category;
    if (authorUsername) query.authorUsername = authorUsername;

    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { content: { $regex: search.trim(), $options: 'i' } },
        { authorUsername: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    let sortOptions = {};
    switch (sortBy) {
      case 'popular':
        sortOptions = { 'stats.likes': -1, 'stats.views': -1 };
        break;
      case 'views':
        sortOptions = { 'stats.views': -1 };
        break;
      case 'trending':
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        query.createdAt = { $gte: oneWeekAgo };
        sortOptions = { 'stats.views': -1, 'stats.likes': -1 };
        break;
      case 'recent':
      default:
        sortOptions = { createdAt: -1 };
        break;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 9));

    const [stories, total] = await Promise.all([
      Story.find(query)
           .populate('author', 'name username bio location stats avatar')
           .sort(sortOptions)
           .limit(limitNum)
           .skip((pageNum - 1) * limitNum)
           .lean(),
      Story.countDocuments(query)
    ]);

    // Get current user's following list if authenticated
    let followingUsernames = [];
    if (req.user) {
      const currentUser = await User.findById(req.user._id)
        .populate('following', 'username name')
        .lean();
      
      if (currentUser && currentUser.following) {
        followingUsernames = currentUser.following
          .map(user => user.username || user.name)
          .filter(Boolean);
      }
    }

    // Add follow status to stories
    const storiesWithMeta = stories.map(s => {
      const storyAuthorUsername = s.authorUsername || s.author?.username || s.author?.name;
      
      // Check if current user is following this story's author
      const isFollowing = req.user ? followingUsernames.some(
        followedUsername => followedUsername.toLowerCase() === storyAuthorUsername?.toLowerCase()
      ) : false;

      return {
        ...s,
        readTime: s.metadata?.readTime || Math.ceil((s.content || '').split(' ').length / 200) || 1,
        isLiked: req.user ? (s.likes || []).some(like => like.toString() === req.user._id.toString()) : false,
        isFollowing: isFollowing,
        displayAuthor: s.authorUsername || s.author?.username || s.author?.name || 'Anonymous',
        excerpt: s.excerpt || (s.content ? s.content.substring(0, 150) + '...' : '')
      };
    });

    res.json({
      success: true,
      stories: storiesWithMeta,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalStories: total,
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1,
        limit: limitNum
      },
      filters: { category: category || 'all', search: search || '', sortBy, authorUsername }
    });
  } catch (err) {
    console.error('Get stories error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching stories'
    });
  }
};

// ✅ FIXED: Complete getStoryById function
exports.getStoryById = async (req, res) => {
  try {
    const storyId = req.params.id;
    const userId = req.user ? req.user._id.toString() : null;

    if (!mongoose.Types.ObjectId.isValid(storyId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid story ID format' 
      });
    }

    const story = await Story.findById(storyId)
      .populate('author', 'name username bio location website stats avatar isVerified')
      .populate({
        path: 'comments.user',
        select: 'name username avatar'
      });

    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    const isOwner = req.user && story.author._id.toString() === req.user._id.toString();
    const isPublished = story.status === 'published';

    if (!isPublished && !isOwner) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    const userKey = userId ? `${userId}_${storyId}` : null;
    const now = Date.now();
    let shouldIncrement = true;

    if (userId && userKey) {
      const userViewData = userViewCounts.get(userKey) || { count: 0, lastView: 0 };
      const timeSinceLastView = now - userViewData.lastView;

      if (timeSinceLastView < 5000 || userViewData.count >= 5 || isOwner) {
        shouldIncrement = false;
      } else {
        userViewCounts.set(userKey, {
          count: userViewData.count + 1,
          lastView: now
        });
      }
    }

    if (shouldIncrement) {
      await Story.findByIdAndUpdate(storyId, { $inc: { views: 1 } });
      if (story.views !== undefined) {
        story.views += 1;
      } else {
        story.views = 1;
      }
    }

    const isLiked = req.user ? (story.likes || []).some(like => like.toString() === req.user._id.toString()) : false;

    res.json({
      success: true,
      story: {
        ...story.toObject(),
        readTime: story.metadata?.readTime || Math.ceil((story.content || '').split(' ').length / 200),
        isLiked,
        displayAuthor: story.authorUsername || story.author?.username || story.author?.name
      }
    });
  } catch (err) {
    console.error('❌ Get story error:', err);
    res.status(500).json({ success: false, message: 'Error fetching story' });
  }
};

// ✅ ENHANCED: Create story with proper authorUsername setting
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

    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    // Ensure authorUsername matches exactly what's in User collection
    const authorUsername = user.username || user.name || `user_${user._id.toString().slice(-6)}`;
    
    console.log('📝 Creating story with author details:', {
      userId: user._id.toString(),
      userName: user.name,
      userUsername: user.username,
      finalAuthorUsername: authorUsername,
      title: title.substring(0, 50)
    });

    const cleanMeta = {};
    if (metadata.recoveryTime) cleanMeta.recoveryTime = metadata.recoveryTime;
    if (metadata.currentStatus) cleanMeta.currentStatus = metadata.currentStatus;
    if (Array.isArray(metadata.keyLessons) && metadata.keyLessons.filter(Boolean).length) {
      cleanMeta.keyLessons = metadata.keyLessons.filter(Boolean);
    }
    if (metadata.readTime) cleanMeta.readTime = metadata.readTime;

    const story = new Story({
      title: title.trim(),
      content: content.trim(),
      category,
      tags: tags.map(t => t.toLowerCase().trim()).slice(0, 5),
      author: user._id,
      authorUsername,
      status,
      metadata: cleanMeta,
      publishedAt: status === 'published' ? new Date() : undefined
    });

    const savedStory = await story.save();
    await savedStory.populate('author', 'name username bio location avatar');

    if (status === 'published') {
      await User.findByIdAndUpdate(
        user._id, 
        { $inc: { 'stats.storiesCount': 1 } }
      );
    }

    console.log('✅ Story created successfully:', {
      storyId: savedStory._id.toString(),
      authorUsername: savedStory.authorUsername,
      status: savedStory.status
    });

    res.status(201).json({
      success: true,
      message: status === 'published' 
        ? 'Story published successfully!' 
        : 'Story saved as draft!',
      story: {
        ...savedStory.toObject(),
        displayAuthor: savedStory.authorUsername,
        author: {
          id: savedStory.author._id,
          name: savedStory.author.name,
          username: savedStory.author.username,
          avatar: savedStory.author.avatar
        }
      }
    });
  } catch (err) {
    console.error('❌ Create story error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating story'
    });
  }
};

// ✅ ADD: Missing trackStoryView function
exports.trackStoryView = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📊 Tracking view for story:', id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid story ID format' 
      });
    }

    const story = await Story.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!story) {
      return res.status(404).json({ 
        success: false, 
        message: 'Story not found' 
      });
    }

    console.log('✅ Story view tracked. New count:', story.views);

    res.json({ 
      success: true, 
      views: story.views,
      message: 'Story view tracked successfully' 
    });
  } catch (error) {
    console.error('❌ Story view tracking error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error tracking story view',
      error: error.message 
    });
  }
};

// ✅ FIXED: Complete getStoriesByAuthor function
exports.getStoriesByAuthor = async (req, res) => {
  try {
    const { authorUsername } = req.params;
    const { 
      page = 1, 
      limit = 20, 
      sort = 'createdAt', 
      order = 'desc' 
    } = req.query;

    console.log('📚 Fetching stories for author:', authorUsername);

    // Find user by username
    const author = await User.findOne({
      $or: [
        { username: { $regex: new RegExp(`^${authorUsername}$`, 'i') } },
        { name: { $regex: new RegExp(`^${authorUsername}$`, 'i') } }
      ]
    });
    
    if (!author) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    // Fetch stories with filtering
    const stories = await Story.find({ 
      $or: [
        { author: author._id },
        { authorUsername: author.username },
        { authorUsername: author.name }
      ],
      // Filter out impact posts and other non-story content
      $and: [
        {
          $or: [
            { type: { $exists: false } },
            { type: 'story' },
            { type: 'fail_story' },
            { type: 'experience' }
          ]
        },
        {
          $and: [
            { category: { $ne: 'impact' } },
            { title: { $not: /impact post/i } }
          ]
        }
      ],
      status: 'published'
    })
      .populate('author', 'username name avatar bio')
      .sort(sortObj)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    // Get total count for pagination
    const totalStories = await Story.countDocuments({ 
      $or: [
        { author: author._id },
        { authorUsername: author.username },
        { authorUsername: author.name }
      ],
      $and: [
        {
          $or: [
            { type: { $exists: false } },
            { type: 'story' },
            { type: 'fail_story' },
            { type: 'experience' }
          ]
        },
        {
          $and: [
            { category: { $ne: 'impact' } },
            { title: { $not: /impact post/i } }
          ]
        }
      ],
      status: 'published'
    });

    console.log(`✅ Found ${stories.length} stories for ${authorUsername}`);

    res.json({
      success: true,
      stories,
      pagination: {
        currentPage: parseInt(page),
        totalStories,
        totalPages: Math.ceil(totalStories / parseInt(limit)),
        hasNext: page * limit < totalStories,
        hasPrev: page > 1
      },
      author: {
        _id: author._id,
        username: author.username,
        name: author.name
      }
    });
  } catch (error) {
    console.error('❌ Get stories by author error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching stories',
      error: error.message 
    });
  }
};

// ✅ LIKE STORY
exports.likeStory = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required to like stories'
      });
    }

    const userId = req.user._id;
    const storyId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(storyId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid story ID format'
      });
    }

    const story = await Story.findById(storyId).select('_id title status author likes stats');
    
    if (!story) {
      return res.status(404).json({ 
        success: false, 
        message: 'Story not found'
      });
    }

    if (story.status !== 'published') {
      return res.status(403).json({ 
        success: false, 
        message: 'Cannot like unpublished stories'
      });
    }

    if (!story.likes) {
      story.likes = [];
    }
    if (!story.stats) {
      story.stats = { views: 0, likes: 0, comments: 0 };
    }

    const likeIndex = story.likes.findIndex(id => id.toString() === userId.toString());
    let isLiked;
    let message;

    if (likeIndex === -1) {
      story.likes.push(userId);
      isLiked = true;
      message = 'Story liked';
    } else {
      story.likes.splice(likeIndex, 1);
      isLiked = false;
      message = 'Like removed';
    }

    story.stats.likes = story.likes.length;
    await story.save();

    return res.json({
      success: true,
      message,
      isLiked,
      likesCount: story.stats.likes
    });
  } catch (err) {
    console.error('❌ Like story error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error toggling like'
    });
  }
};

// ✅ ADD COMMENT
exports.addComment = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required to add comments'
      });
    }

    const userId = req.user._id;
    const storyId = req.params.id;
    const { content } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Comment content is required' 
      });
    }

    if (content.trim().length > 1000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Comment is too long (maximum 1000 characters)' 
      });
    }

    if (!mongoose.Types.ObjectId.isValid(storyId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid story ID format' 
      });
    }

    const story = await Story.findById(storyId).select('_id title status comments stats');
    
    if (!story) {
      return res.status(404).json({ 
        success: false, 
        message: 'Story not found' 
      });
    }

    if (story.status !== 'published') {
      return res.status(403).json({ 
        success: false, 
        message: 'Cannot comment on unpublished stories' 
      });
    }

    if (!story.comments) {
      story.comments = [];
    }
    if (!story.stats) {
      story.stats = { views: 0, likes: 0, comments: 0 };
    }

    const newComment = {
      user: userId,
      content: content.trim(),
      createdAt: new Date()
    };

    story.comments.push(newComment);
    story.stats.comments = story.comments.length;
    
    await story.save();

    await story.populate({
      path: 'comments.user',
      select: 'name username avatar'
    });

    const addedComment = story.comments[story.comments.length - 1];

    if (!addedComment.user || !addedComment.user.name) {
      addedComment.user = {
        _id: req.user._id,
        name: req.user.name,
        username: req.user.username,
        avatar: req.user.avatar
      };
    }

    return res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: addedComment,
      commentsCount: story.stats.comments
    });
  } catch (err) {
    console.error('❌ Add comment error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error adding comment'
    });
  }
};

// ✅ UPDATE STORY
exports.updateStory = async (req, res) => {
  try {
    const storyId = req.params.id;
    const userId = req.user._id;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(storyId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid story ID format' 
      });
    }

    const story = await Story.findById(storyId);
    
    if (!story) {
      return res.status(404).json({ 
        success: false, 
        message: 'Story not found' 
      });
    }

    if (story.author.toString() !== userId.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this story' 
      });
    }

    const updatedStory = await Story.findByIdAndUpdate(
      storyId,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('author', 'name username avatar');

    res.json({
      success: true,
      message: 'Story updated successfully',
      story: updatedStory
    });
  } catch (err) {
    console.error('❌ Update story error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating story' 
    });
  }
};

// ✅ DELETE STORY
exports.deleteStory = async (req, res) => {
  try {
    const storyId = req.params.id;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(storyId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid story ID format' 
      });
    }

    const story = await Story.findById(storyId);
    
    if (!story) {
      return res.status(404).json({ 
        success: false, 
        message: 'Story not found' 
      });
    }

    if (story.author.toString() !== userId.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this story' 
      });
    }

    await Story.findByIdAndDelete(storyId);

    // Update user's story count
    await User.findByIdAndUpdate(
      userId,
      { $inc: { 'stats.storiesCount': -1 } }
    );

    res.json({
      success: true,
      message: 'Story deleted successfully'
    });
  } catch (err) {
    console.error('❌ Delete story error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting story' 
    });
  }
};

// ✅ GET COMMENTS
exports.getComments = async (req, res) => {
  try {
    const storyId = req.params.id;
    const { page = 1, limit = 10 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(storyId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid story ID format' 
      });
    }

    const story = await Story.findById(storyId)
      .populate({
        path: 'comments.user',
        select: 'name username avatar'
      })
      .select('comments');

    if (!story) {
      return res.status(404).json({ 
        success: false, 
        message: 'Story not found' 
      });
    }

    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const comments = story.comments.slice(startIndex, endIndex);

    res.json({ 
      success: true, 
      comments,
      pagination: {
        currentPage: parseInt(page),
        totalComments: story.comments.length,
        totalPages: Math.ceil(story.comments.length / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('❌ Get comments error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching comments' 
    });
  }
};
