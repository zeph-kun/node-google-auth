const express = require('express');
const router = express.Router();
const {
  generateGoogleAuthUrl,
  handleGoogleCallback,
  logout,
  getProfile,
} = require('../controllers/authController');
const { isAuthenticated, isNotAuthenticated } = require('../middleware/auth');

// Google OAuth login
router.get('/auth/google', isNotAuthenticated, (req, res) => {
  const url = generateGoogleAuthUrl(req);
  res.redirect(url);
});

// Google OAuth callback
router.get('/auth/google/callback', handleGoogleCallback);

// Logout
router.get('/logout', isAuthenticated, logout);

// Get user profile (protected route)
router.get('/profile', isAuthenticated, getProfile);

module.exports = router;
