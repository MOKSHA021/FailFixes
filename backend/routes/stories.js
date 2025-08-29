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
  getStoriesByAuthor
} = require('../controllers/storyController');

const { auth, optionalAuth } = require('../middleware/auth');

router.use((req, res, next) => {
  console.log(`\n📚 STORY ROUTE: ${req.method} ${req.originalUrl}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Params:', req.params);
  console.log('Query:', req.query);
  console.log('Body:', req.body);
  next();
});

router.get('/', optionalAuth, getAllStories);
router.get('/author/:authorUsername', optionalAuth, getStoriesByAuthor);
router.get('/:id', optionalAuth, getStoryById);
router.get('/:id/comments', optionalAuth, getComments);
router.post('/', auth, createStory);
router.put('/:id', auth, updateStory);
router.delete('/:id', auth, deleteStory);
router.patch('/:id/like', auth, likeStory);
router.post('/:id/comment', auth, addComment);

module.exports = router;
