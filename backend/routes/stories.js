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
  trackStoryView  // ✅ Import the function
} = require('../controllers/storyController');

const { auth, optionalAuth } = require('../middleware/auth');

router.use((req, res, next) => {
  console.log(`\n📚 STORY ROUTE: ${req.method} ${req.originalUrl}`);
  console.log('Params:', req.params);
  console.log('Query:', req.query);
  next();
});

// ✅ Routes in correct order
router.get('/', optionalAuth, getAllStories);
router.get('/author/:authorUsername', optionalAuth, getStoriesByAuthor);
router.post('/', auth, createStory);

// ✅ This is probably line 34 - make sure trackStoryView exists
router.post('/:id/view', trackStoryView);

router.get('/:id', optionalAuth, getStoryById);
router.get('/:id/comments', optionalAuth, getComments);
router.put('/:id', auth, updateStory);
router.delete('/:id', auth, deleteStory);
router.patch('/:id/like', auth, likeStory);
router.post('/:id/comment', auth, addComment);

module.exports = router;
