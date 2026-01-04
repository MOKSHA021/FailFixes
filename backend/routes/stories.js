const express = require('express');
const router = express.Router();

const {
  getAllStories,
  getStoryById,
  createStory,
  updateStory,
  deleteStory,
  likeStory,
  addComment,
  getComments,
  getStoriesByAuthor,
  trackStoryView
} = require('../controllers/storyController');

const { protect, optionalAuth } = require('../middleware/auth');

// 🎯 MIDDLEWARE LOGGING
router.use((req, res, next) => {
  console.log(`\n📚 STORY ROUTE: ${req.method} ${req.originalUrl}`);
  console.log('Params:', req.params);
  console.log('Query:', req.query);
  next();
});

// ========== PUBLIC ROUTES ==========
router.get('/', optionalAuth, getAllStories);

// ========== AUTHOR-SPECIFIC ROUTES (MUST COME BEFORE /:id) ==========
router.get('/author/:authorUsername', optionalAuth, getStoriesByAuthor);

// ========== STORY-SPECIFIC ACTIONS (MUST COME BEFORE GENERIC /:id) ==========
router.post('/:id/view', trackStoryView);
router.post('/:id/like', protect, likeStory);          // ✅ POST not PATCH
router.post('/:id/comments', protect, addComment);     // ✅ /comments not /comment
router.get('/:id/comments', optionalAuth, getComments);

// ========== GENERAL STORY CRUD (MUST BE LAST) ==========
router.get('/:id', optionalAuth, getStoryById);
router.put('/:id', protect, updateStory);
router.delete('/:id', protect, deleteStory);

// ========== PROTECTED CREATE ROUTE ==========
router.post('/', protect, createStory);

module.exports = router;
