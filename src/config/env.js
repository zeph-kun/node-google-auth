require('dotenv').config();

module.exports = {
  CLIENT_ID: process.env.CLIENT_ID,
  SECRET_ID: process.env.SECRET_ID,
  REDIRECT_URI: process.env.REDIRECT_URI || 'http://localhost:3000/auth/google/callback',
  SESSION_SECRET: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
};