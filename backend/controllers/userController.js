const User = require('../models/User');
const Story = require('../models/Story');
const mongoose = require('mongoose');

// 🎯 BULLETPROOF FOLLOW FUNCTION
exports.followUser = async (req, res) => {
  const startTime = Date.now();
  console.log('\n=== FOLLOW USER CONTROLLER START ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Request Method:', req.method);
  console.log('Request URL:', req.originalUrl);
  console.log('Request Params:', JSON.stringify(req.params, null, 2));

  try {
    if (!req.user) {
      console.error('❌ STEP 1 FAILED: No authenticated user');
      return res.status(401).json({
        success: false,
        message: 'Authentication required to follow users',
        code: 'NO_AUTH'
      });
    }

    const currentUserId = req.user._id;
    const { username } = req.params;
    
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      console.error('❌ STEP 2 FAILED: Invalid username parameter:', username);
      return res.status(400).json({
        success: false,
        message: 'Username parameter is required and must be a valid string',
        code: 'INVALID_USERNAME_PARAM'
      });
    }

    const targetUsername = username.trim();
    const currentUsername = req.user.username || req.user.name || '';
    
    if (targetUsername.toLowerCase() === currentUsername.toLowerCase()) {
      console.error('❌ STEP 3 FAILED: Self-follow attempt');
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself',
        code: 'SELF_FOLLOW_ATTEMPT'
      });
    }

    const userToFollow = await User.findOne({
      $or: [
        { username: { $regex: new RegExp(`^${targetUsername}$`, 'i') } },
        { name: { $regex: new RegExp(`^${targetUsername}$`, 'i') } }
      ]
    }).select('_id username name followers stats');

    if (!userToFollow) {
      console.error('❌ STEP 4 FAILED: Target user not found:', targetUsername);
      return res.status(404).json({
        success: false,
        message: `User '${targetUsername}' not found`,
        code: 'USER_NOT_FOUND'
      });
    }

    if (userToFollow._id.toString() === currentUserId.toString()) {
      console.error('❌ STEP 5 FAILED: Self-follow detected by ID match');
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself',
        code: 'SELF_FOLLOW_ID_MATCH'
      });
    }

    if (!userToFollow.followers) {
      userToFollow.followers = [];
    }

    const isCurrentlyFollowing = userToFollow.followers.some(
      followerId => followerId.toString() === currentUserId.toString()
    );

    let action, message, newFollowStatus;

    if (isCurrentlyFollowing) {
      await Promise.all([
        User.findByIdAndUpdate(userToFollow._id, {
          $pull: { followers: currentUserId },
          $inc: { 'stats.followersCount': -1 }
        }),
        User.findByIdAndUpdate(currentUserId, {
          $pull: { following: userToFollow._id },
          $inc: { 'stats.followingCount': -1 }
        })
      ]);

      action = 'unfollowed';
      message = `Unfollowed ${userToFollow.username || userToFollow.name}`;
      newFollowStatus = false;
    } else {
      await Promise.all([
        User.findByIdAndUpdate(userToFollow._id, {
          $addToSet: { followers: currentUserId },
          $inc: { 'stats.followersCount': 1 }
        }),
        User.findByIdAndUpdate(currentUserId, {
          $addToSet: { following: userToFollow._id },
          $inc: { 'stats.followingCount': 1 }
        })
      ]);

      action = 'followed';
      message = `Now following ${userToFollow.username || userToFollow.name}`;
      newFollowStatus = true;
    }

    const executionTime = Date.now() - startTime;
    console.log(`✅ ${action.toUpperCase()} operation successful`);
    console.log('=== FOLLOW USER CONTROLLER END ===\n');

    return res.status(200).json({
      success: true,
      message: message,
      isFollowing: newFollowStatus,
      action: action,
      user: {
        id: userToFollow._id.toString(),
        username: userToFollow.username,
        name: userToFollow.name
      },
      executionTime: executionTime
    });

  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error('\n❌ FOLLOW USER ERROR:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error during follow operation',
      code: 'FOLLOW_OPERATION_ERROR',
      executionTime: executionTime
    });
  }
};

// 🎯 ENHANCED: Get user feed with follow status included
exports.getUserFeed = async (req, res) => {
  console.log('\n📰 === USER FEED WITH FOLLOW STATUS ===');
  
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user._id;
    
    console.log('Feed request details:', {
      userId: userId.toString(),
      page: page,
      limit: limit,
      timestamp: new Date().toISOString()
    });
    
    // Get current user with following list
    const currentUser = await User.findById(userId)
      .populate('following', 'username name _id')
      .lean();
    
    if (!currentUser) {
      console.error('❌ Current user not found');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const followingIds = currentUser.following || [];
    console.log('✅ Following data:', {
      followingCount: followingIds.length,
      followingUsers: followingIds.map(u => ({
        id: u._id.toString(),
        username: u.username,
        name: u.name
      }))
    });
    
    if (followingIds.length === 0) {
      console.log('👥 User is not following anyone - returning empty feed');
      return res.json({
        success: true,
        stories: [],
        pagination: {
          currentPage: parseInt(page),
          totalPages: 0,
          totalStories: 0,
          hasNext: false,
          hasPrev: false
        },
        debug: {
          followingCount: 0,
          followedUsersFound: 0,
          validUsernames: 0,
          storiesFound: 0
        },
        message: 'Follow some users to see their stories in your feed!'
      });
    }
    
    // Extract usernames for story lookup
    const followedUsernames = followingIds
      .map(user => user.username || user.name)
      .filter(username => username && username.trim().length > 0);
    
    console.log('✅ Username variations:', {
      uniqueUsernames: followedUsernames.length,
      usernames: followedUsernames
    });
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    // Query stories with multiple strategies
    let stories = [];
    let total = 0;
    
    // Strategy 1: Query by authorUsername
    console.log('🔄 Strategy 1: Query by authorUsername...');
    stories = await Story.find({
      authorUsername: { $in: followedUsernames },
      status: 'published'
    })
    .populate('author', 'name username bio avatar')
    .sort({ createdAt: -1 })
    .limit(limitNum)
    .skip((pageNum - 1) * limitNum)
    .lean();
    
    console.log('📊 Strategy 1 results:', {
      storiesFound: stories.length,
      queryUsernames: followedUsernames
    });
    
    // Strategy 2: If no stories found, query by author ObjectId
    if (stories.length === 0) {
      console.log('🔄 Strategy 2: Query by author ObjectId...');
      const followingObjectIds = followingIds.map(u => u._id);
      
      stories = await Story.find({
        author: { $in: followingObjectIds },
        status: 'published'
      })
      .populate('author', 'name username bio avatar')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .lean();
      
      console.log('📊 Strategy 2 results:', {
        storiesFound: stories.length,
        queryObjectIds: followingObjectIds.map(id => id.toString())
      });
    }

    // Get total count for pagination
    if (stories.length > 0) {
      total = await Story.countDocuments({
        $or: [
          { authorUsername: { $in: followedUsernames } },
          { author: { $in: followingIds.map(u => u._id) } }
        ],
        status: 'published'
      });
    }

    // 🎯 CRITICAL: Add isFollowing status to each story
    const storiesWithFollowStatus = stories.map(story => {
      const storyAuthorUsername = story.authorUsername;
      
      // Check if current user is following this story's author
      const isFollowing = followingIds.some(followedUser => {
        const followedUsername = followedUser.username || followedUser.name;
        return followedUsername && 
               followedUsername.toLowerCase() === storyAuthorUsername?.toLowerCase();
      });

      return {
        ...story,
        isFollowing: isFollowing, // 🎯 ADD THIS FIELD
        readTime: story.metadata?.readTime || Math.ceil((story.content || '').split(' ').length / 200) || 1,
        isLiked: story.likes ? story.likes.some(like => like.toString() === userId.toString()) : false,
        displayAuthor: story.authorUsername,
        excerpt: story.content ? story.content.substring(0, 150) + '...' : ''
      };
    });

    const response = {
      success: true,
      stories: storiesWithFollowStatus, // 🎯 RETURN STORIES WITH FOLLOW STATUS
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalStories: total,
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1
      },
      debug: {
        followingCount: followingIds.length,
        followedUsersFound: followingIds.length,
        usernameVariations: followedUsernames.length,
        uniqueUsernames: followedUsernames.length,
        storiesFound: stories.length,
        totalStoriesInDB: total
      }
    };

    console.log('🏁 === USER FEED END ===\n');
    res.json(response);

  } catch (err) {
    console.error('\n❌ === USER FEED ERROR ===');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);

    res.status(500).json({ 
      success: false, 
      message: 'Error fetching user feed',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// Dashboard functionality
exports.getUserDashboard = async (req, res) => {
  try {
    console.log('📊 Dashboard request for user:', req.user._id.toString());
    
    const userId = req.user._id;
    const userUsername = req.user.username || req.user.name || `user_${userId.toString().slice(-6)}`;

    const user = await User.findById(userId)
      .select('name username stats createdAt bio avatar followers following')
      .populate('followers', 'name username avatar bio stats')
      .populate('following', 'name username avatar bio stats')
      .lean();
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userStories = await Story.find({ 
      authorUsername: userUsername
    }).lean();

    const totalStories = userStories.length;
    const publishedStories = userStories.filter(s => s.status === 'published').length;
    const draftStories = userStories.filter(s => s.status === 'draft').length;
    const totalViews = userStories.reduce((sum, s) => sum + (s.stats?.views || 0), 0);
    const totalLikes = userStories.reduce((sum, s) => sum + (s.stats?.likes || 0), 0);
    const totalComments = userStories.reduce((sum, s) => sum + (s.stats?.comments || 0), 0);

    const recentStories = userStories
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3)
      .map(story => ({
        id: story._id.toString(),
        title: story.title,
        status: story.status,
        views: story.stats?.views || 0,
        likes: story.stats?.likes || 0,
        comments: story.stats?.comments || 0,
        createdAt: story.createdAt,
        category: story.category
      }));

    const recentFollowers = (user.followers || [])
      .slice(-5)
      .reverse()
      .map(follower => ({
        id: follower._id,
        name: follower.name,
        username: follower.username || follower.name,
        avatar: follower.avatar,
        stats: follower.stats
      }));

    const recentFollowing = (user.following || [])
      .slice(-5)
      .reverse()
      .map(followed => ({
        id: followed._id,
        name: followed.name,
        username: followed.username || followed.name,
        avatar: followed.avatar,
        stats: followed.stats
      }));

    const currentFollowersCount = user.followers?.length || 0;
    const currentFollowingCount = user.following?.length || 0;

    res.json({
      success: true,
      dashboard: {
        user: {
          name: user.name,
          username: user.username || user.name,
          displayUsername: userUsername,
          memberSince: user.createdAt,
          bio: user.bio,
          avatar: user.avatar
        },
        stats: {
          storiesShared: totalStories,
          published: publishedStories,
          drafts: draftStories,
          totalViews: totalViews,
          totalLikes: totalLikes,
          heartsReceived: totalLikes,
          totalComments: totalComments,
          followersCount: currentFollowersCount,
          followingCount: currentFollowingCount
        },
        recentStories,
        recentFollowers,
        recentFollowing,
        growth: {
          growthRate: 0,
          isPositive: true
        }
      }
    });

  } catch (error) {
    console.error('❌ Dashboard error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching dashboard data'
    });
  }
};

// Placeholder methods for other endpoints
exports.getSuggestedUsers = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    
    const suggestedUsers = await User.find({
      _id: { $ne: currentUserId },
      followers: { $ne: currentUserId }
    })
    .select('name username bio avatar stats createdAt')
    .sort({ 'stats.followersCount': -1, createdAt: -1 })
    .limit(10)
    .lean();

    const enhancedUsers = suggestedUsers.map(user => ({
      ...user,
      displayUsername: user.username || user.name || `user_${user._id.toString().slice(-6)}`,
      isFollowing: false
    }));

    res.json({
      success: true,
      users: enhancedUsers
    });
  } catch (err) {
    console.error('Get suggested users error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching suggested users' 
    });
  }
};

exports.getUserProfileByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await User.findOne({
      $or: [{ username }, { name: username }]
    }).select('-password -email');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const displayUsername = user.username || user.name || `user_${user._id.toString().slice(-6)}`;
    
    const storiesCount = await Story.countDocuments({ 
      authorUsername: displayUsername, 
      status: 'published' 
    });

    const isFollowing = req.user ? (user.followers || []).some(
      followerId => followerId.toString() === req.user._id.toString()
    ) : false;

    res.json({
      success: true,
      profile: {
        ...user.toObject(),
        displayUsername,
        storiesCount,
        isFollowing,
        canFollow: req.user && req.user._id.toString() !== user._id.toString()
      }
    });
  } catch (err) {
    console.error('Get user profile error:', err);
    res.status(500).json({ success: false, message: 'Error fetching user profile' });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    res.json({ success: true, stats: {} });  
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching user stats' });
  }
};

exports.getUserStories = async (req, res) => {
  try {
    res.json({ success: true, stories: [] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching user stories' });
  }
};

exports.getUserAnalytics = async (req, res) => {
  try {
    res.json({ success: true, analytics: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching analytics' });
  }
};

exports.getLikedStories = async (req, res) => {
  try {
    res.json({ success: true, likedStories: [] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching liked stories' });
  }
};

exports.getUserActivity = async (req, res) => {
  try {
    res.json({ success: true, activities: [] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching user activity' });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, profile: user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching profile' });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    res.json({ success: true, message: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating profile' });
  }
};

exports.getUserFollowers = async (req, res) => {
  try {
    res.json({ success: true, followers: [] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching followers' });
  }
};

exports.getUserFollowing = async (req, res) => {
  try {
    res.json({ success: true, following: [] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching following' });
  }
};

exports.getViewTrends = async (req, res) => {
  try {
    res.json({ success: true, trends: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching view trends' });
  }
};

exports.getEngagementMetrics = async (req, res) => {
  try {
    res.json({ success: true, metrics: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching engagement metrics' });
  }
};
