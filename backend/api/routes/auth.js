// backend/api/routes/auth.js

const express = require('express');
const router = express.Router();

// --- CORRECTED IMPORT PATHS ---
// The controller and middleware are now in sibling folders.
const {
    register,
    login,
    refresh,
    logout,
    forgotPassword,
    resetPassword,
    me
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// --- Public Routes ---
// These routes do not require an access token.
router.post('/register', register);
router.post('/login', login); // This is the route causing the 405 error if not found
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:resetToken', resetPassword);

// --- Protected/Private Routes ---
// These routes use cookies or tokens.
router.post('/refresh', refresh);
router.post('/logout', logout);

// This route requires a valid access token in the Authorization header.
router.get('/me', protect, me);

module.exports = router;