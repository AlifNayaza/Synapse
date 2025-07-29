const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
    getUserProfile, 
    updateUserProfile, 
    changeUserPassword 
} = require('../controllers/userController');

// @route   GET /api/users/profile
// @desc    Mendapatkan profil pengguna yang login
// @access  Private
router.get('/profile', protect, getUserProfile);

// @route   PUT /api/users/profile
// @desc    Memperbarui profil pengguna
// @access  Private
router.put('/profile', protect, updateUserProfile);

// @route   PUT /api/users/password
// @desc    Mengubah password pengguna
// @access  Private
router.put('/password', protect, changeUserPassword);

module.exports = router;