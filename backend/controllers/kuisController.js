const Kuis = require('../models/Kuis');
const Submission = require('../models/Submission');
const MataKuliah = require('../models/MataKuliah');
const User = require('../models/User'); // <-- Impor model User
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Menggunakan model terbaru

// Dosen & Admin: Membuat kuis baru
exports.createKuis = async (req, res) => {
    const { judul, pertanyaan, waktuPengerjaan, mataKuliahId, tanggalBuka, tenggat } = req.body;
    try {
        const mataKuliah = await MataKuliah.findById(mataKuliahId);
        if (!mataKuliah) return res.status(404).json({ message: 'Mata Kuliah tidak ditemukan' });

        const isOwner = mataKuliah.dosenId.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Akses ditolak.' });
        }

        const kuisBaru = new Kuis({
            judul, pertanyaan, waktuPengerjaan, mataKuliahId,
            tanggalBuka: tanggalBuka ? new Date(tanggalBuka) : new Date(),
            tenggat: new Date(tenggat)
        });
        const kuis = await kuisBaru.save();
        
        const io = req.app.get('socketio');
        
        mataKuliah.mahasiswaIds.forEach(mhsId => {
            io.to(mhsId.toString()).emit('kuisBaru', kuis);
        });
        io.to(mataKuliahId.toString()).emit('kuisBaru', kuis);
        io.emit('dataChanged', { reason: 'New quiz created', mataKuliahId });

        res.status(201).json(kuis);
    } catch (error) {
        console.error('Error creating quiz:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Dosen & Admin: Menghapus kuis
exports.deleteKuis = async (req, res) => {
    try {
        const kuisId = req.params.id;
        const kuis = await Kuis.findById(kuisId);
        if (!kuis) return res.status(404).json({ message: 'Kuis tidak ditemukan' });
        
        const mataKuliah = await MataKuliah.findById(kuis.mataKuliahId);
        if (!mataKuliah) return res.status(404).json({ message: 'Mata kuliah terkait tidak ditemukan' });
        
        const isOwner = mataKuliah.dosenId.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Akses ditolak' });
        }
        
        await Submission.deleteMany({ kuisId: kuisId });
        await Kuis.findByIdAndDelete(kuisId);
        
        const io = req.app.get('socketio');

        mataKuliah.mahasiswaIds.forEach(mhsId => {
            io.to(mhsId.toString()).emit('kuisDihapus', { kuisId });
        });
        io.to(kuis.mataKuliahId.toString()).emit('kuisDihapus', { kuisId });
        io.emit('dataChanged', { reason: 'A quiz was deleted', mataKuliahId: kuis.mataKuliahId });

        res.json({ message: 'Kuis dan semua hasil pengerjaan terkait berhasil dihapus.' });
    } catch (error) {
        console.error('Error deleting quiz:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Mengambil kuis per mata kuliah dengan statistik
exports.getKuisByMataKuliah = async (req, res) => {
    try {
        const mataKuliahId = new mongoose.Types.ObjectId(req.params.mataKuliahId);
        const kuisWithStats = await Kuis.aggregate([
            { $match: { mataKuliahId: mataKuliahId } },
            { $lookup: { from: 'submissions', localField: '_id', foreignField: 'kuisId', as: 'submissions' } },
            { $addFields: { jumlahSubmission: { $size: '$submissions' }, rataRataNilai: { $avg: '$submissions.skor' } } },
            { $project: { submissions: 0, 'pertanyaan.kunciJawaban': 0 } },
            { $sort: { tanggalBuka: -1 } }
        ]);
        res.json(kuisWithStats);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Mendapatkan detail kuis
exports.getKuisById = async (req, res) => {
    try {
        const kuis = await Kuis.findById(req.params.id)
            .populate('mataKuliahId', 'nama kode') 
            .select('-pertanyaan.kunciJawaban');
            
        if (!kuis) return res.status(404).json({ message: 'Kuis tidak ditemukan' });
        res.json(kuis);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Mahasiswa: Memulai kuis
exports.startKuis = async (req, res) => {
    try {
        const kuisId = req.params.id;
        const mahasiswaId = req.user.id;
        
        const kuis = await Kuis.findById(kuisId);
        if (!kuis) return res.status(404).json({ message: 'Kuis tidak ditemukan.' });

        const now = new Date();
        if (now > new Date(kuis.tenggat) || now < new Date(kuis.tanggalBuka)) {
             return res.status(400).json({ message: 'Kuis tidak sedang dalam periode pengerjaan.' });
        }
        
        const [mahasiswa, mataKuliah] = await Promise.all([
            User.findById(mahasiswaId),
            MataKuliah.findById(kuis.mataKuliahId)
        ]);
        if (!mahasiswa || !mataKuliah) {
            return res.status(404).json({ message: 'Data mahasiswa atau mata kuliah tidak ditemukan.' });
        }

        const submission = await Submission.findOneAndUpdate(
            { kuisId, mahasiswaId },
            { 
                // --- PERBAIKAN: Gunakan $setOnInsert ---
                $setOnInsert: { 
                    kuisId, 
                    mahasiswaId, 
                    status: 'dikerjakan',
                    namaMahasiswa: mahasiswa.nama,
                    nim: mahasiswa.nim,
                    mataKuliahId: mataKuliah._id,
                    namaMataKuliah: mataKuliah.nama
                } 
            },
            { new: true, upsert: true }
        );

        if (submission.status === 'dinilai') {
            return res.status(400).json({ message: 'Anda sudah pernah menyelesaikan kuis ini.' });
        }
        
        res.status(200).json(submission);

    } catch (error) {
        console.error("[startKuis] Server Error:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Mahasiswa: Submit Jawaban Kuis
exports.submitKuis = async (req, res) => {
    const { jawaban } = req.body;
    const { submissionId } = req.params;

    try {
        const initialSubmission = await Submission.findOne({ _id: submissionId, mahasiswaId: req.user.id });
        if (!initialSubmission) return res.status(404).json({ message: 'Submission tidak ditemukan.' });

        const kuis = await Kuis.findById(initialSubmission.kuisId);
        if (!kuis) return res.status(404).json({ message: 'Kuis tidak ditemukan' });
        
        const mataKuliah = await MataKuliah.findById(kuis.mataKuliahId);
        if (!mataKuliah) return res.status(404).json({ message: 'Mata kuliah tidak ditemukan' });
        
        let totalSkor = 0;
        const jawabanDenganFeedback = [];
        const jumlahSoal = kuis.pertanyaan.length;
        const skorPerSoal = jumlahSoal > 0 ? 100 / jumlahSoal : 0;

        for (const jawab of jawaban) {
            const p = kuis.pertanyaan.find(p => p._id.toString() === jawab.pertanyaanId);
            if (!p) continue;

            let skorDiberikan = 0;
            let feedbackAI = null;
            let isBenar = null;

            if (p.tipe === 'pilihanGanda') {
                if (p.kunciJawaban.trim().toLowerCase() === jawab.jawabanTeks.trim().toLowerCase()) {
                    skorDiberikan = skorPerSoal; isBenar = true;
                } else {
                    skorDiberikan = 0; isBenar = false;
                }
            } else if (p.tipe === 'essay') {
                const prompt = `Anda adalah asisten penilai dosen. Berikan skor dari 0 hingga ${Math.round(skorPerSoal)} dan feedback singkat untuk jawaban mahasiswa. Format balasan Anda harus: "SKOR|FEEDBACK". Contoh: "85|Penjelasan Anda sudah baik.". Pertanyaan: "${p.soal}". Kriteria Penilaian: "${p.kunciJawaban}". Jawaban Mahasiswa: "${jawab.jawabanTeks}"`;
                
                try {
                    const result = await model.generateContent(prompt);
                    const text = result.response.text();
                    const parts = text.split('|');
                    if (parts.length >= 2) {
                        const skorAngka = parseFloat(parts[0].trim());
                        if (!isNaN(skorAngka)) {
                            skorDiberikan = Math.min(skorAngka, skorPerSoal);
                            feedbackAI = parts[1] ? parts[1].trim() : "Tidak ada feedback tambahan.";
                        }
                    }
                } catch (aiError) {
                    console.error("AI grading error:", aiError);
                    feedbackAI = "Gagal mendapatkan feedback dari AI karena terjadi error.";
                }
                isBenar = null;
            }

            totalSkor += skorDiberikan;
            jawabanDenganFeedback.push({ 
                pertanyaanId: jawab.pertanyaanId, jawabanTeks: jawab.jawabanTeks, 
                aiFeedback: feedbackAI, isBenar: isBenar 
            });
        }

        // --- AMBIL DATA USER JIKA BELUM ADA DI SUBMISSION (FALLBACK) ---
        const mahasiswa = await User.findById(req.user.id);
        
        const updatedSubmission = await Submission.findByIdAndUpdate(
            submissionId,
            { 
                $set: { 
                    jawaban: jawabanDenganFeedback, 
                    skor: Math.round(totalSkor), 
                    status: 'dinilai',
                    tanggalPengumpulan: new Date()
                } 
            },
            { new: true }
        );
        if (!updatedSubmission) return res.status(404).json({ message: 'Gagal menyimpan submission.' });
        
        const io = req.app.get('socketio');
        io.to(req.user.id).emit('kuisDinilai', updatedSubmission);
        io.emit('dataChanged', { reason: 'Quiz has been scored' });
        
        const stats = await Submission.aggregate([
            { $match: { kuisId: kuis._id } },
            { $group: { _id: null, count: { $sum: 1 }, avg: { $avg: "$skor" } } }
        ]);

        if (stats.length > 0) {
            const payload = {
                kuisId: kuis._id.toString(),
                jumlahSubmission: stats[0].count,
                rataRataNilai: stats[0].avg
            };
            io.to(mataKuliah.dosenId.toString()).emit('kuisStatsUpdated', payload);
        }

        res.status(200).json(updatedSubmission);
    } catch (error) {
        console.error("Error submitting quiz:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Mahasiswa: Mencatat log pindah tab
exports.logPindahTab = async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.submissionId);
        if (submission && submission.mahasiswaId.toString() === req.user.id) {
            submission.logKecurangan.push({ event: 'Pindah Tab' });
            await submission.save();
            res.status(200).json({ message: 'Log berhasil dicatat.' });
        } else {
            res.status(404).json({ message: 'Akses ditolak.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Mendapatkan hasil kuis (submission)
exports.getHasilKuis = async (req, res) => {
    try {
        const { id: kuisId } = req.params;
        const { user } = req;

        if (user.role === 'dosen' || user.role === 'admin') {
            const submissions = await Submission.find({ kuisId }); // Tidak perlu populate lagi
            return res.json(submissions);
        } 
        
        const submission = await Submission.findOne({ kuisId, mahasiswaId: user.id });
        if (!submission) {
            return res.status(404).json({ message: 'Anda belum mengerjakan kuis ini.' });
        }

        const kuis = await Kuis.findById(kuisId);
        if (!kuis) {
            return res.status(404).json({ message: 'Kuis terkait tidak ditemukan.' });
        }
        
        res.json({
            submission: submission,
            kuis: kuis 
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Dosen & Admin: Menilai ulang/override skor kuis
exports.overrideSkorKuis = async (req, res) => {
    const { skor, feedback } = req.body;
    try {
        const submission = await Submission.findById(req.params.submissionId).populate('kuisId');
        if (!submission) return res.status(404).json({ message: 'Submission tidak ditemukan' });

        const mataKuliah = await MataKuliah.findById(submission.kuisId.mataKuliahId);
        const isOwner = mataKuliah.dosenId.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';
        if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Akses ditolak.' });
        
        submission.skor = skor;
        submission.feedback = `(Dinilai Ulang) ${feedback || ''}`;
        submission.status = 'dinilai';
        const updatedSubmission = await submission.save();
        
        const io = req.app.get('socketio');
        io.to(submission.mahasiswaId.toString()).emit('kuisDinilai', updatedSubmission);
        io.emit('dataChanged', { reason: 'A quiz score was overridden' });
        
        res.json(updatedSubmission);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};