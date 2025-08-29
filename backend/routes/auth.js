const express = require('express');
const router = express.Router();
const { signup, login, getMe } = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { validateSignup, validateLogin } = require('../middleware/validation');

// POST /api/auth/register - Register new user (for your frontend)
router.post('/register', validateSignup, signup);

// POST /api/auth/signup - Alternative register route
router.post('/signup', validateSignup, signup);

// POST /api/auth/login - Login user
router.post('/login', validateLogin, login);

// GET /api/auth/me - Get current user info
router.get('/me', auth, getMe);

module.exports = router;
