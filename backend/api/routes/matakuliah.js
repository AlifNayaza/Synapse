// backend/routes/matakuliah.js

const express = require('express');
const router = express.Router();
const { protect, isDosen } = require('../api/middleware/authMiddleware');
const { 
    createMataKuliah, 
    getAllMataKuliah,
    getMataKuliahById,
    getMataKuliahByDosen, 
    getMataKuliahByMahasiswa, 
    enrollMataKuliah,
    unenrollMahasiswa,
    updateMataKuliahByDosen,
    getAllSubmissionsByMataKuliah
} = require('../api/controllers/matakuliahController');

// Rute statis harus di atas rute dinamis '/:id'
router.get('/', protect, getAllMataKuliah);
router.get('/dosen', protect, isDosen, getMataKuliahByDosen);
router.get('/mahasiswa', protect, getMataKuliahByMahasiswa);

// Rute dinamis yang menggunakan parameter :id
router.get('/:id', protect, getMataKuliahById);
router.get('/:id/submissions', protect, getAllSubmissionsByMataKuliah);

router.post('/', protect, isDosen, createMataKuliah);
router.post('/:id/enroll', protect, enrollMataKuliah);

router.put('/:id', protect, isDosen, updateMataKuliahByDosen);

// Rute ini bisa diakses oleh Dosen (pemilik) atau Admin
router.delete('/:id/unenroll/:mahasiswaId', protect, unenrollMahasiswa);

module.exports = router;