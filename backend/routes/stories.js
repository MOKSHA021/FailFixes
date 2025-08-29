const express = require('express');
const router = express.Router();

// Import controller functions
const {
  getAllStories,
  createStory,
  getStoryById,
  updateStory,
  deleteStory,
  likeStory,     // 🎯 NEW: Like/unlike functionality
  addComment,    // 🎯 NEW: Add comment functionality
  getComments    // 🎯 NEW: Get comments with pagination
} = require('../controllers/storyController');

// Import middleware
const { auth, optionalAuth } = require('../middleware/auth');
const { validateStory, validateObjectId } = require('../middleware/validation');

// ═══════════════════════════════════════════════════════════════════════════════
// STORY CRUD ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// @route   GET /api/stories
// @desc    Get all stories with filters (search, category, sorting, pagination)
// @access  Public (optional auth for user-specific data like isLiked)
router.get('/', optionalAuth, getAllStories);

// @route   POST /api/stories  
// @desc    Create new story
// @access  Private (authenticated users only)
router.post('/', auth, validateStory, createStory);

// @route   GET /api/stories/:id
// @desc    Get single story by ID (increments view count automatically)
// @access  Public (optional auth for user-specific data like isLiked)
router.get('/:id', validateObjectId, optionalAuth, getStoryById);

// @route   PUT /api/stories/:id
// @desc    Update story (title, content, category, tags, etc.)
// @access  Private (story owner only)
router.put('/:id', validateObjectId, auth, validateStory, updateStory);

// @route   DELETE /api/stories/:id
// @desc    Delete story (soft delete recommended in production)
// @access  Private (story owner only) 
router.delete('/:id', validateObjectId, auth, deleteStory);

// ═══════════════════════════════════════════════════════════════════════════════
// INTERACTION ROUTES (LIKES & COMMENTS)
// ═══════════════════════════════════════════════════════════════════════════════

// @route   PATCH /api/stories/:id/like
// @desc    Toggle like/unlike story (optimistic updates supported)
// @access  Private (authenticated users only)
// @returns { success, message, isLiked, likesCount }
router.patch('/:id/like', validateObjectId, auth, likeStory);

// @route   POST /api/stories/:id/comment
// @desc    Add new comment to story
// @access  Private (authenticated users only)
// @body    { content: string (required, max 500 chars) }
// @returns { success, message, comment, commentsCount }
router.post('/:id/comment', validateObjectId, auth, addComment);

// @route   GET /api/stories/:id/comments
// @desc    Get story comments with pagination
// @access  Public (no auth required to read comments)
// @query   ?page=1&limit=10 (optional pagination params)
// @returns { success, comments, pagination }
router.get('/:id/comments', validateObjectId, getComments);

// ═══════════════════════════════════════════════════════════════════════════════
// FUTURE ROUTES (READY FOR EXPANSION)
// ═══════════════════════════════════════════════════════════════════════════════

// Uncomment these when ready to implement:

// // @route   POST /api/stories/:id/bookmark
// // @desc    Bookmark/unbookmark story
// // @access  Private
// // router.post('/:id/bookmark', validateObjectId, auth, bookmarkStory);

// // @route   POST /api/stories/:id/share
// // @desc    Track story shares and generate share links
// // @access  Public
// // router.post('/:id/share', validateObjectId, shareStory);

// // @route   POST /api/stories/:id/report
// // @desc    Report inappropriate content
// // @access  Private
// // router.post('/:id/report', validateObjectId, auth, reportStory);

// // @route   GET /api/stories/:id/analytics
// // @desc    Get story analytics (views, engagement over time)
// // @access  Private (story owner only)
// // router.get('/:id/analytics', validateObjectId, auth, getStoryAnalytics);

module.exports = router;
