const express = require('express');
const router = express.Router();
const { getHome, getLogin } = require('../controllers/homeController');

// Home page
router.get('/', getHome);

// Login page
router.get('/login', getLogin);

module.exports = router;
