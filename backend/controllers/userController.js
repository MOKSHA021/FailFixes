const User = require('../models/User');
const Story = require('../models/Story');

// @desc    Get user dashboard
// @route   GET /api/users/dashboard
// @access  Private
exports.getUserDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const [userStories, totalViews, totalLikes] = await Promise.all([
      Story.find({ author: userId }).lean(),
      Story.aggregate([
        { $match: { author: userId } },
        { $group: { _id: null, total: { $sum: '$stats.views' } } }
      ]),
      Story.aggregate([
        { $match: { author: userId } },
        { $group: { _id: null, total: { $sum: '$stats.likes' } } }
      ])
    ]);
    
    const stats = {
      storiesShared: userStories.length,
      totalViews: totalViews[0]?.total || 0,
      heartsReceived: totalLikes[0]?.total || 0,
      drafts: userStories.filter(s => s.status === 'draft').length,
      published: userStories.filter(s => s.status === 'published').length
    };

    const recentStories = userStories
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5)
      .map(story => ({
        id: story._id,
        title: story.title,
        status: story.status,
        views: story.stats?.views || 0,
        likes: story.stats?.likes || 0,
        category: story.category,
        createdAt: story.createdAt,
        updatedAt: story.updatedAt,
        publishedAt: story.publishedAt
      }));

    res.json({
      success: true,
      stats,
      recentStories,
      user: {
        name: req.user.name,
        username: req.user.username,
        joinedDate: req.user.createdAt,
        totalStories: userStories.length
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching dashboard data' 
    });
  }
};

// @desc    Get user's stories
// @route   GET /api/users/stories
// @access  Private
exports.getUserStories = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = { author: req.user._id };
    if (status) {
      query.status = status;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const [stories, total] = await Promise.all([
      Story.find(query)
        .sort({ updatedAt: -1 })
        .limit(limitNum)
        .skip((pageNum - 1) * limitNum)
        .lean(),
      Story.countDocuments(query)
    ]);

    const storiesWithMeta = stories.map(story => ({
      ...story,
      readTime: story.metadata?.readTime || Math.ceil(story.content.split(' ').length / 200)
    }));

    res.json({
      success: true,
      stories: storiesWithMeta,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalStories: total
      }
    });
  } catch (error) {
    console.error('Get user stories error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching your stories' 
    });
  }
};
