const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, isDosen } = require('../middleware/authMiddleware');

// --- PASTIKAN SEMUA FUNGSI DIIMPOR DENGAN BENAR ---
const { 
    createTugas, 
    updateTugas,
    deleteTugas,
    getTugasByMataKuliah,
    getTugasById, 
    submitTugas, 
    getSubmissionsForTugas,
    nilaiTugas,
    deleteSubmission,
    updateTenggat
} = require('../controllers/tugasController');
// ===============================================

const storage = multer.diskStorage({
    destination: function(req, file, cb) { cb(null, 'uploads/'); },
    filename: function(req, file, cb) { cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`); }
});
const upload = multer({ storage: storage });

// Dosen & Admin routes untuk TUGAS
router.post('/', protect, isDosen, upload.single('lampiranTugas'), createTugas);
router.put('/:id', protect, isDosen, upload.single('lampiranTugas'), updateTugas);
router.delete('/:id', protect, isDosen, deleteTugas);
router.put('/:id/tenggat', protect, isDosen, updateTenggat);

// Rute untuk SUBMISSION
router.get('/:id/submissions', protect, isDosen, getSubmissionsForTugas);
router.put('/submissions/:submissionId/nilai', protect, isDosen, nilaiTugas);
router.delete('/submissions/:submissionId', protect, isDosen, deleteSubmission);

// Rute untuk mengambil tugas berdasarkan mata kuliah
router.get('/matakuliah/:mataKuliahId', protect, getTugasByMataKuliah);

// Mahasiswa & Dosen routes (detail)
router.get('/:id', protect, getTugasById);

// Mahasiswa routes (submit)
router.post('/:id/submit', protect, upload.single('fileTugas'), submitTugas);

module.exports = router;