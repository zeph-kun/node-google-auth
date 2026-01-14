const express = require('express');
const session = require('express-session');
const authRoutes = require('./routes/authRoutes');
const { SESSION_SECRET } = require('./config/env');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure sessions
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

// Routes
app.use('/', authRoutes);

// Home page
app.get('/', (req, res) => {
  if (req.session.user) {
    res.send(`
      <h1>Welcome ${req.session.user.name}!</h1>
      <img src="${req.session.user.picture}" alt="profile" style="width: 100px; border-radius: 50%;">
      <p>Email: ${req.session.user.email}</p>
      <a href="/logout">Logout</a>
    `);
  } else {
    res.send('<a href="/auth/google">Login with Google</a>');
  }
});

// Login page
app.get('/login', (req, res) => {
  const error = req.query.error ? `<p style="color: red;">Error: ${req.query.error}</p>` : '';
  res.send(`
    <h1>Login</h1>
    ${error}
    <a href="/auth/google">Login with Google</a>
  `);
});

module.exports = app;
