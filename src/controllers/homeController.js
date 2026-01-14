// Home page - show profile if logged in
const getHome = (req, res) => {
  res.render('home', {
    user: req.session.user || null,
  });
};

// Login page
const getLogin = (req, res) => {
  const error = req.query.error || null;
  res.render('login', {
    error: error,
  });
};

module.exports = {
  getHome,
  getLogin,
};
