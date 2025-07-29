const Tugas = require('../models/Tugas');
const Submission = require('../models/Submission');
const MataKuliah = require('../models/MataKuliah');
const User = require('../models/User'); // <-- Impor model User
const mongoose = require('mongoose');
const fs = require('fs'); 
const path = require('path');

// Dosen & Admin: Membuat tugas baru
exports.createTugas = async (req, res) => {
    const { judul, deskripsi, tenggat, mataKuliahId, tanggalBuka } = req.body;
    const lampiranUrl = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        const mataKuliah = await MataKuliah.findById(mataKuliahId);
        if (!mataKuliah) return res.status(404).json({ message: 'Mata Kuliah tidak ditemukan' });

        const isOwner = mataKuliah.dosenId.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Akses ditolak' });
        }

        const tugasBaru = new Tugas({ 
            judul, deskripsi, tenggat, mataKuliahId,
            tanggalBuka: tanggalBuka ? new Date(tanggalBuka) : new Date(),
            lampiranUrl
        });
        const tugas = await tugasBaru.save();
        
        const io = req.app.get('socketio');
        
        mataKuliah.mahasiswaIds.forEach(mhsId => {
            io.to(mhsId.toString()).emit('tugasBaru', tugas);
        });
        
        io.to(mataKuliahId.toString()).emit('tugasBaru', tugas);
        io.emit('dataChanged', { reason: 'New assignment created', mataKuliahId });
        
        res.status(201).json(tugas);
    } catch (error) {
        console.error('Error creating assignment:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Dosen & Admin: Memperbarui detail tugas
exports.updateTugas = async (req, res) => {
    try {
        const tugas = await Tugas.findById(req.params.id);
        if (!tugas) return res.status(404).json({ message: 'Tugas tidak ditemukan' });
        
        const mataKuliah = await MataKuliah.findById(tugas.mataKuliahId);
        if (!mataKuliah) return res.status(404).json({ message: 'Mata Kuliah terkait tidak ditemukan' });
        
        const isOwner = mataKuliah.dosenId.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';
        if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Akses ditolak' });

        tugas.judul = req.body.judul || tugas.judul;
        tugas.deskripsi = req.body.deskripsi || tugas.deskripsi;
        
        if (req.file) {
            const newLampiranUrl = `/uploads/${req.file.filename}`;
            if (tugas.lampiranUrl) {
                const oldFilePath = path.join(__dirname, '..', tugas.lampiranUrl);
                fs.unlink(oldFilePath, (err) => {
                    if (err) console.error(`Gagal menghapus file lampiran lama: ${oldFilePath}`, err);
                });
            }
            tugas.lampiranUrl = newLampiranUrl;
        }

        const updatedTugas = await tugas.save();
        
        const io = req.app.get('socketio');
        io.to(tugas.mataKuliahId.toString()).emit('tugasUpdated', updatedTugas);
        
        res.json(updatedTugas);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Dosen & Admin: Menghapus sebuah TUGAS dan semua data terkaitnya
exports.deleteTugas = async (req, res) => {
    try {
        const tugasId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(tugasId)) {
            return res.status(400).json({ message: 'Format ID Tugas tidak valid' });
        }
        
        const tugas = await Tugas.findById(tugasId);
        if (!tugas) return res.status(404).json({ message: 'Tugas tidak ditemukan' });

        const mataKuliah = await MataKuliah.findById(tugas.mataKuliahId);
        if (!mataKuliah) return res.status(404).json({ message: 'Mata Kuliah terkait tidak ditemukan' });

        const isOwner = mataKuliah.dosenId.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';
        if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Akses ditolak' });

        const submissions = await Submission.find({ tugasId: tugasId });
        submissions.forEach(sub => {
            if (sub.fileUrl) {
                const filePath = path.join(__dirname, '..', sub.fileUrl);
                fs.unlink(filePath, (err) => {
                    if (err) console.error(`Gagal menghapus file terkait: ${filePath}`, err);
                });
            }
        });

        await Submission.deleteMany({ tugasId: tugasId });
        await Tugas.findByIdAndDelete(tugasId);
        
        const io = req.app.get('socketio');
        io.to(tugas.mataKuliahId.toString()).emit('tugasDihapus', { tugasId });
        io.emit('dataChanged', { reason: 'An assignment was deleted' });

        res.json({ message: 'Tugas dan semua submission terkait berhasil dihapus.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Mengambil semua tugas untuk satu mata kuliah dengan statistik
exports.getTugasByMataKuliah = async (req, res) => {
    try {
        const { mataKuliahId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(mataKuliahId)) {
            return res.status(400).json({ message: 'Format ID Mata Kuliah tidak valid' });
        }
        const mkId = new mongoose.Types.ObjectId(mataKuliahId);

        const tugasWithStats = await Tugas.aggregate([
            { $match: { mataKuliahId: mkId } },
            { $lookup: { from: 'submissions', localField: '_id', foreignField: 'tugasId', as: 'submissions' } },
            {
                $addFields: {
                    jumlahSubmission: { $size: '$submissions' },
                    rataRataNilai: {
                        $avg: {
                            $map: {
                                input: { $filter: { input: '$submissions', as: 'sub', cond: { $eq: ['$$sub.status', 'dinilai'] } } },
                                as: 'graded', in: '$$graded.nilai'
                            }
                        }
                    }
                }
            },
            { $project: { submissions: 0 } },
            { $sort: { tanggalBuka: -1 } }
        ]);
        res.json(tugasWithStats);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Mendapatkan detail satu tugas
exports.getTugasById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Format ID Tugas tidak valid' });
        }
        const tugas = await Tugas.findById(id).populate('mataKuliahId', 'nama');
        if (!tugas) return res.status(404).json({ message: 'Tugas tidak ditemukan' });
        res.json(tugas);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Mahasiswa: Mengumpulkan atau memperbarui tugas
exports.submitTugas = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'File wajib diunggah.' });
        }

        const tugasId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(tugasId)) {
            return res.status(400).json({ message: 'Format ID Tugas tidak valid' });
        }

        const tugas = await Tugas.findById(tugasId);
        if (!tugas) {
            return res.status(404).json({ message: 'Tugas tidak ditemukan' });
        }

        if (new Date() > new Date(tugas.tenggat)) {
            return res.status(400).json({ message: 'Tenggat waktu telah berakhir.' });
        }

        const [mataKuliah, mahasiswa] = await Promise.all([
            MataKuliah.findById(tugas.mataKuliahId),
            User.findById(req.user.id)
        ]);
        
        if (!mataKuliah) return res.status(404).json({ message: 'Mata kuliah terkait tidak ditemukan' });
        if (!mahasiswa) return res.status(404).json({ message: 'Data mahasiswa tidak ditemukan.' });
        
        const isEnrolled = mataKuliah.mahasiswaIds.some(id => id.equals(req.user.id));
        if (!isEnrolled) {
            return res.status(403).json({ message: 'Anda tidak terdaftar di mata kuliah ini.' });
        }

        const fileUrl = `/uploads/${req.file.filename}`;

        const submission = await Submission.findOneAndUpdate(
            { tugasId: tugasId, mahasiswaId: req.user.id },
            { 
                // --- PERBAIKAN: Pisahkan antara update dan insert ---
                // Data yang diupdate setiap kali submit ulang
                $set: { 
                    fileUrl: fileUrl, 
                    status: 'dikumpulkan', 
                    tanggalPengumpulan: new Date()
                },
                // Data yang hanya diset saat dokumen pertama kali dibuat (upsert)
                $setOnInsert: {
                    tugasId: tugasId,
                    mahasiswaId: req.user.id,
                    namaMahasiswa: mahasiswa.nama,
                    nim: mahasiswa.nim,
                    mataKuliahId: mataKuliah._id,
                    namaMataKuliah: mataKuliah.nama
                }
                // kuisId akan tetap `undefined` dan tidak disimpan, sehingga sparse index bekerja
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        
        const io = req.app.get('socketio');
        io.to(mataKuliah.dosenId.toString()).emit('submissionBaru', submission);
        
        res.status(200).json({ message: 'Tugas berhasil dikumpulkan/diperbarui', submission });

    } catch (error) {
        // Log error asli dari database
        console.error('[submitTugas] Server Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Dosen: Melihat semua submission untuk satu tugas
exports.getSubmissionsForTugas = async (req, res) => {
     try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Format ID Tugas tidak valid' });
        }
        const submissions = await Submission.find({ tugasId: id }); // Tidak perlu populate lagi
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Dosen: Memberi nilai tugas
exports.nilaiTugas = async (req, res) => {
    const { submissionId } = req.params;
    const { nilai, feedback } = req.body;

    try {
        if (!mongoose.Types.ObjectId.isValid(submissionId)) {
            return res.status(400).json({ message: 'Format ID Submission tidak valid' });
        }
        const submission = await Submission.findById(submissionId).populate('tugasId');
        if (!submission) {
            return res.status(404).json({ message: 'Submission tidak ditemukan.' });
        }

        const mataKuliah = await MataKuliah.findById(submission.tugasId.mataKuliahId);
        if (!mataKuliah || (mataKuliah.dosenId.toString() !== req.user.id && req.user.role !== 'admin')) {
            return res.status(403).json({ message: 'Akses ditolak.' });
        }

        submission.nilai = nilai;
        submission.feedback = feedback;
        submission.status = 'dinilai';
        const updatedSubmission = await submission.save();
        
        const io = req.app.get('socketio');
        io.to(submission.mahasiswaId.toString()).emit('tugasDinilai', updatedSubmission);
        io.emit('dataChanged', { reason: 'An assignment was graded' });
        res.json(updatedSubmission);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Dosen: Menghapus submission tugas individual
exports.deleteSubmission = async (req, res) => {
    try {
        const { submissionId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(submissionId)) {
            return res.status(400).json({ message: 'Format ID Submission tidak valid' });
        }

        const submission = await Submission.findById(submissionId);
        if (!submission) return res.status(404).json({ message: 'Submission tidak ditemukan' });
        
        if (submission.fileUrl) {
            const filePath = path.join(__dirname, '..', submission.fileUrl);
            fs.unlink(filePath, (err) => {
                if (err) console.error(`Gagal menghapus file: ${filePath}`, err);
            });
        }
        await Submission.findByIdAndDelete(submissionId);
        res.json({ message: 'Submission berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Dosen & Admin: Memperbarui tenggat waktu tugas
exports.updateTenggat = async (req, res) => {
    const { tenggat } = req.body;
    if (!tenggat) return res.status(400).json({ message: 'Tenggat waktu baru harus diisi' });

    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Format ID Tugas tidak valid' });
        }

        const tugas = await Tugas.findById(id);
        if (!tugas) return res.status(404).json({ message: 'Tugas tidak ditemukan' });
        
        const mataKuliah = await MataKuliah.findById(tugas.mataKuliahId);
        if (!mataKuliah) return res.status(404).json({ message: 'Mata Kuliah terkait tidak ditemukan' });
        
        const isOwner = mataKuliah.dosenId.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';
        if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Akses ditolak' });
        
        tugas.tenggat = new Date(tenggat);
        await tugas.save();

        const io = req.app.get('socketio');
        io.emit('tenggatUpdated', { tugasId: tugas._id, tenggatBaru: tugas.tenggat });
        
        res.json(tugas);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};