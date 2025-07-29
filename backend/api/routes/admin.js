const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/isAdmin');

// Impor semua fungsi controller yang dibutuhkan
const { 
    createDosen, 
    getAllUsers, 
    deleteUser, 
    getGlobalStats, 
    updateMataKuliah,
    deleteMataKuliah,
    deleteMultipleUsers // Impor fungsi baru
} = require('../controllers/adminController');

// Semua rute di file ini akan diproteksi oleh isAdmin middleware
// Middleware ini akan berjalan untuk setiap request ke rute di bawah ini.
router.use(protect, isAdmin);

// --- Rute Pengguna ---

// @route   POST /api/admin/create-dosen
// @desc    Admin membuat akun dosen baru
// @access  Private (Admin)
router.post('/create-dosen', createDosen);

// @route   GET /api/admin/users
// @desc    Admin mendapatkan daftar semua pengguna
// @access  Private (Admin)
router.get('/users', getAllUsers);

// @route   DELETE /api/admin/users/:userId
// @desc    Admin menghapus satu pengguna berdasarkan ID
// @access  Private (Admin)
router.delete('/users/:userId', deleteUser);

// @route   POST /api/admin/users/delete-multiple
// @desc    Admin menghapus beberapa pengguna sekaligus
// @access  Private (Admin)
router.post('/users/delete-multiple', deleteMultipleUsers);


// --- Rute Statistik ---

// @route   GET /api/admin/stats
// @desc    Admin mendapatkan statistik global
// @access  Private (Admin)
router.get('/stats', getGlobalStats);


// --- Rute Mata Kuliah (khusus Admin) ---

// @route   PUT /api/admin/matakuliah/:mataKuliahId
// @desc    Admin memperbarui data mata kuliah
// @access  Private (Admin)
router.put('/matakuliah/:mataKuliahId', updateMataKuliah);

// @route   DELETE /api/admin/matakuliah/:mataKuliahId
// @desc    Admin menghapus mata kuliah dan semua data terkaitnya
// @access  Private (Admin)
router.delete('/matakuliah/:mataKuliahId', deleteMataKuliah);


module.exports = router;