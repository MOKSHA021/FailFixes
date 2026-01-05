const express = require('express');
const router = express.Router();
const Cache = require('../utils/cache'); // ✅ ADD CACHE

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

// ========== PUBLIC ROUTES WITH CACHE ✅ ==========

// Get all stories (5 minutes cache)
router.get('/', optionalAuth, Cache.middleware('stories', 300), getAllStories);

// Get stories by author (10 minutes cache)
router.get('/author/:authorUsername', optionalAuth, Cache.middleware('author-stories', 600), getStoriesByAuthor);

// Get comments (2 minutes cache)
router.get('/:id/comments', optionalAuth, Cache.middleware('comments', 120), getComments);

// Get story by ID (5 minutes cache - shorter for view updates)
router.get('/:id', optionalAuth, Cache.middleware('story', 300), getStoryById);

// ========== WRITE OPERATIONS (NO CACHE) ==========

// Track view (NO cache - updates view count)
router.post('/:id/view', trackStoryView);

// Like story
router.post('/:id/like', protect, likeStory);

// Comments
router.post('/:id/comments', protect, addComment);

// CRUD operations
router.post('/', protect, createStory);
router.put('/:id', protect, updateStory);
router.delete('/:id', protect, deleteStory);

// ========== CACHE MANAGEMENT (OPTIONAL) ==========
router.get('/cache/stats', async (req, res) => {
  const stats = await Cache.getStats();
  res.json({ success: true, stats });
});

router.delete('/cache/clear', protect, async (req, res) => {
  await Cache.clearAll();
  res.json({ success: true, message: 'All cache cleared' });
});

module.exports = router;
