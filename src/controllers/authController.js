const axios = require('axios');
const crypto = require('crypto');
const { CLIENT_ID, SECRET_ID, REDIRECT_URI } = require('../config/env');
const User = require('../models/User');

// Generate Google OAuth URL with state parameter
const generateGoogleAuthUrl = (req) => {
  const state = crypto.randomBytes(32).toString('hex');
  req.session.oauthState = state;
  
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=profile%20email&state=${state}`;
  return url;
};

// Exchange code for access token and fetch user profile
const handleGoogleCallback = async (req, res) => {
  const { code, state, error } = req.query;

  try {
    // Validate code existence
    if (!code) {
      console.error('Missing authorization code');
      return res.status(400).redirect('/login?error=missing_code');
    }

    // Validate state parameter (CSRF protection)
    if (!state || state !== req.session.oauthState) {
      console.error('Invalid state parameter - possible CSRF attack');
      return res.status(400).redirect('/login?error=invalid_state');
    }

    // Clear state after validation
    delete req.session.oauthState;

    // Exchange authorization code for access token
    const { data } = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: CLIENT_ID,
      client_secret: SECRET_ID,
      code,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    });

    const { access_token } = data;

    // Fetch user profile
    const { data: profile } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    // Upsert user in database (create if not exists)
    try {
      console.log('🔍 Searching for user with email:', profile.email);
      const existing = await User.findOne({ email: profile.email });
      
      if (existing) {
        // Update fields if necessary
        console.log('✏️ User exists, updating...');
        existing.name = profile.name || existing.name;
        existing.picture = profile.picture || existing.picture;
        existing.googleId = profile.id || existing.googleId;
        await existing.save();
        req.session.user = {
          id: existing._id,
          email: existing.email,
          name: existing.name,
          picture: existing.picture,
        };
        console.log('✅ Existing user signed in:', existing.email);
      } else {
        console.log('➕ Creating new user...');
        const created = await User.create({
          googleId: profile.id,
          email: profile.email,
          name: profile.name,
          picture: profile.picture,
        });
        req.session.user = {
          id: created._id,
          email: created.email,
          name: created.name,
          picture: created.picture,
        };
        console.log('✅ New user created:', created.email);
      }
      return res.redirect('/');
    } catch (dbErr) {
      console.error('❌ DB error:', dbErr.message || dbErr);
      console.error('Full DB error:', dbErr);
      return res.status(500).redirect('/login?error=db_error: ' + encodeURIComponent(dbErr.message));
    }
  } catch (error) {
    console.error('Axios error:', error.toJSON ? error.toJSON() : error);

    const message =
      error.response?.data?.error ||
      error.response?.data?.error_description ||
      error.message ||
      'Unknown error';

    console.error('Error message:', message);
    res.status(500).redirect(`/login?error=${encodeURIComponent(message)}`);
  }
};

// Logout user
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).send('Logout failed');
    }
    res.clearCookie('connect.sid'); // Default session cookie name
    res.redirect('/login');
  });
};

// Get user profile
const getProfile = (req, res) => {
  res.json({ user: req.session.user });
};

module.exports = {
  generateGoogleAuthUrl,
  handleGoogleCallback,
  logout,
  getProfile,
};
