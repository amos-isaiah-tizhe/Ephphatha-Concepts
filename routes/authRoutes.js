// routes/authRoutes.js
const express = require('express');
const router = express.Router();

const { renderLogin, login, logout } = require('../controllers/authController');
const { redirectIfAuthenticated, requireAuth } = require('../middleware/auth');
const { loginValidators, handleValidation } = require('../middleware/validators');
const { adminLoginLimiter } = require('../middleware/rateLimiter');

router.get('/login', redirectIfAuthenticated, renderLogin);
router.post('/login', adminLoginLimiter, redirectIfAuthenticated, loginValidators, handleValidation, login);
router.post('/logout', requireAuth, logout);

module.exports = router;
