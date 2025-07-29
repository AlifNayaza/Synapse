const MataKuliah = require('../models/MataKuliah');
const User = require('../models/User');
const Tugas = require('../models/Tugas');
const Kuis = require('../models/Kuis');
const Submission = require('../models/Submission');

// ... (fungsi create, get, enroll, dll.)
// Mendapatkan semua submission (tugas & kuis) oleh satu mahasiswa
exports.getSubmissionsByMahasiswaId = async (req, res) => {
    try {
        // Validasi bahwa pengguna yang meminta adalah pengguna yang sama
        // atau seorang dosen (opsional, tapi praktik yang baik)
        if (req.user.id !== req.params.mahasiswaId && req.user.role !== 'dosen') {
            return res.status(403).json({ message: 'Akses ditolak' });
        }

        // Cari semua submission yang cocok dengan mahasiswaId dari parameter URL
        const submissions = await Submission.find({ mahasiswaId: req.params.mahasiswaId })
            .sort({ createdAt: -1 }); // Urutkan dari yang terbaru

        res.json(submissions);
    } catch (error) {
        console.error("Error saat mengambil submission mahasiswa:", error);
        res.status(500).json({ message: 'Server error' });
    }
};
