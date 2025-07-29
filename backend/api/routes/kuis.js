const express = require('express');
const router = express.Router();
const { protect, isDosen } = require('../middleware/authMiddleware');
const { 
    createKuis, deleteKuis, getKuisById, submitKuis, getHasilKuis,
    overrideSkorKuis, getKuisByMataKuliah, startKuis, logPindahTab
} = require('../controllers/kuisController');

// Dosen routes
router.post('/', protect, isDosen, createKuis);
router.delete('/:id', protect, isDosen, deleteKuis);
router.put('/submissions/:submissionId/override', protect, isDosen, overrideSkorKuis);

// Rute untuk mengambil kuis berdasarkan mata kuliah
router.get('/matakuliah/:mataKuliahId', protect, getKuisByMataKuliah);

// Mahasiswa & Dosen routes (Detail & Hasil)
router.get('/:id', protect, getKuisById);
router.get('/:id/hasil', protect, getHasilKuis); 

// Mahasiswa Action routes
router.post('/:id/start', protect, startKuis);
router.post('/log-kecurangan/:submissionId', protect, logPindahTab);
router.put('/submit/:submissionId', protect, submitKuis); // <<< Menggunakan PUT dan submissionId

module.exports = router;