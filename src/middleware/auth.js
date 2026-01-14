// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).redirect('/login');
  }
  next();
};

// Middleware to check if user is not authenticated
const isNotAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  next();
};

module.exports = {
  isAuthenticated,
  isNotAuthenticated,
};
