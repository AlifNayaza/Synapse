const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getSubmissionsByMahasiswaId } = require('../controllers/mahasiswaController');

// @route   GET /api/mahasiswa/submissions/:mahasiswaId
// @desc    Mendapatkan semua submission milik satu mahasiswa
// @access  Private (membutuhkan login)
router.get('/submissions/:mahasiswaId', protect, getSubmissionsByMahasiswaId);

module.exports = router;