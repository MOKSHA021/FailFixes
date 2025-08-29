const express = require('express');
const router = express.Router();
const { getUserDashboard, getUserStories } = require('../controllers/userController');
const { auth } = require('../middleware/auth');

// @route   GET /api/users/dashboard
// @desc    Get user dashboard data
// @access  Private
router.get('/dashboard', auth, getUserDashboard);

// @route   GET /api/users/stories
// @desc    Get user's stories
// @access  Private
router.get('/stories', auth, getUserStories);

module.exports = router;
