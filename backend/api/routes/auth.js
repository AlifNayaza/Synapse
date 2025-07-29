// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const {
    register, login, refresh, logout, forgotPassword, resetPassword, me
} = require('../api/controllers/authController');
const { protect } = require('../api/middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:resetToken', resetPassword);

// KEMBALIKAN RUTE INI
router.post('/refresh', refresh);
router.post('/logout', logout);

router.get('/me', protect, me);

module.exports = router;