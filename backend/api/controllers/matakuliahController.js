const mongoose = require('mongoose'); // Impor mongoose untuk validasi ObjectId
const MataKuliah = require('../models/MataKuliah');
const User = require('../models/User');
const Tugas = require('../models/Tugas');
const Kuis = require('../models/Kuis');
const Submission = require('../models/Submission');

// Dosen: Membuat mata kuliah baru
exports.createMataKuliah = async (req, res) => {
    const { nama, kode, deskripsi } = req.body;
    try {
        const mataKuliahExists = await MataKuliah.findOne({ kode });
        if (mataKuliahExists) {
            return res.status(400).json({ message: 'Kode mata kuliah sudah ada' });
        }
        const mataKuliahBaru = new MataKuliah({
            nama, kode, deskripsi, dosenId: req.user.id
        });
        const mataKuliah = await mataKuliahBaru.save();
        const io = req.app.get('socketio');
        io.emit('dataChanged', { reason: 'Lecturer created a new course' });
        res.status(201).json(mataKuliah);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Dosen: Mendapatkan semua mata kuliah yang dia ajar
exports.getMataKuliahByDosen = async (req, res) => {
    try {
        const courses = await MataKuliah.find({ dosenId: req.user.id }).populate('mahasiswaIds', 'nama');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Mahasiswa: Mendapatkan semua mata kuliah yang diikuti
exports.getMataKuliahByMahasiswa = async (req, res) => {
    try {
        const courses = await MataKuliah.find({ mahasiswaIds: req.user.id }).populate('dosenId', 'nama');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Semua Pengguna (Login): Mendapatkan daftar semua mata kuliah
exports.getAllMataKuliah = async (req, res) => {
    try {
        const courses = await MataKuliah.find()
            .populate('dosenId', 'nama')
            .populate('mahasiswaIds', 'nama email nim');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Semua Pengguna (Login): Mendapatkan detail satu mata kuliah
exports.getMataKuliahById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Format ID mata kuliah tidak valid.' });
        }

        const course = await MataKuliah.findById(id)
            .populate('dosenId', 'nama')
            .populate('mahasiswaIds', 'nama email nim');
        
        if (!course) {
            return res.status(404).json({ message: 'Mata kuliah tidak ditemukan' });
        }

        const totalMahasiswa = course.mahasiswaIds.length;
        
        // 1. Hitung rata-rata untuk semua TUGAS
        const tugasIds = await Tugas.find({ mataKuliahId: course._id }).distinct('_id');
        let totalNilaiTugas = 0;
        if (tugasIds.length > 0) {
            const result = await Submission.aggregate([
                { $match: { tugasId: { $in: tugasIds }, nilai: { $exists: true, $ne: null } } },
                { $group: { _id: null, total: { $sum: "$nilai" } } }
            ]);
            totalNilaiTugas = result.length > 0 ? result[0].total : 0;
        }
        // Pembagi adalah jumlah total mahasiswa DIKALI jumlah total tugas
        const rataRataTugas = (totalMahasiswa > 0 && tugasIds.length > 0) 
            ? totalNilaiTugas / (totalMahasiswa * tugasIds.length) 
            : 0;

        // 2. Hitung rata-rata untuk semua KUIS
        const kuisIds = await Kuis.find({ mataKuliahId: course._id }).distinct('_id');
        let totalNilaiKuis = 0;
        if (kuisIds.length > 0) {
            const result = await Submission.aggregate([
                { $match: { kuisId: { $in: kuisIds }, skor: { $exists: true, $ne: null } } },
                { $group: { _id: null, total: { $sum: "$skor" } } }
            ]);
            totalNilaiKuis = result.length > 0 ? result[0].total : 0;
        }
        // Pembagi adalah jumlah total mahasiswa DIKALI jumlah total kuis
        const rataRataKuis = (totalMahasiswa > 0 && kuisIds.length > 0)
            ? totalNilaiKuis / (totalMahasiswa * kuisIds.length)
            : 0;

        const courseData = course.toObject();
        courseData.rataRataTugas = rataRataTugas;
        courseData.rataRataKuis = rataRataKuis;

        res.json(courseData);

    } catch (error) {
        console.error("Error fetching course by ID:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Mahasiswa: Mendaftar ke sebuah mata kuliah
exports.enrollMataKuliah = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Format ID mata kuliah tidak valid.' });
        }

        const course = await MataKuliah.findById(id);
        if (!course) return res.status(404).json({ message: 'Mata kuliah tidak ditemukan' });
        if (course.mahasiswaIds.includes(req.user.id)) return res.status(400).json({ message: 'Anda sudah terdaftar' });
        
        course.mahasiswaIds.push(req.user.id);
        await course.save();

        const io = req.app.get('socketio');
        const updatedCourse = await MataKuliah.findById(id).populate('mahasiswaIds', 'nama email nim');
        
        const payload = {
            mataKuliahId: course._id.toString(),
            mahasiswaIds: updatedCourse.mahasiswaIds,
        };
        io.to(course.dosenId.toString()).emit('mahasiswaListUpdated', payload);

        res.json({ message: `Berhasil mendaftar di mata kuliah ${course.nama}` });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Dosen atau Admin: Mengeluarkan mahasiswa dari mata kuliah
exports.unenrollMahasiswa = async (req, res) => {
    try {
        const { id: mataKuliahId, mahasiswaId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(mataKuliahId) || !mongoose.Types.ObjectId.isValid(mahasiswaId)) {
            return res.status(400).json({ message: 'Format ID tidak valid.' });
        }

        const mataKuliah = await MataKuliah.findById(mataKuliahId);
        if (!mataKuliah) {
            return res.status(404).json({ message: 'Mata kuliah tidak ditemukan' });
        }

        const isOwner = mataKuliah.dosenId.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Akses ditolak.' });
        }

        mataKuliah.mahasiswaIds.pull(mahasiswaId);
        await mataKuliah.save();

        const tugasIds = await Tugas.find({ mataKuliahId }).select('_id');
        const kuisIds = await Kuis.find({ mataKuliahId }).select('_id');
        
        await Submission.deleteMany({ 
            mahasiswaId: mahasiswaId, 
            $or: [
                { tugasId: { $in: tugasIds.map(t => t._id) } },
                { kuisId: { $in: kuisIds.map(k => k._id) } }
            ]
        });

        res.json({ message: 'Mahasiswa berhasil dikeluarkan dan semua submission terkait telah dihapus.' });
    } catch (error) {
        console.error("Error saat mengeluarkan mahasiswa:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Dosen: Memperbarui mata kuliah yang dimiliki
exports.updateMataKuliahByDosen = async (req, res) => {
    const { id } = req.params;
    const { nama, kode, deskripsi } = req.body;

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Format ID mata kuliah tidak valid.' });
        }

        let mataKuliah = await MataKuliah.findById(id);
        if (!mataKuliah) {
            return res.status(404).json({ message: 'Mata kuliah tidak ditemukan' });
        }

        if (mataKuliah.dosenId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Akses ditolak. Anda bukan pemilik mata kuliah ini.' });
        }

        if (kode && kode !== mataKuliah.kode) {
            const kodeExists = await MataKuliah.findOne({ kode, _id: { $ne: id } });
            if (kodeExists) {
                return res.status(400).json({ message: 'Kode mata kuliah sudah digunakan' });
            }
        }

        const updateFields = { nama, kode, deskripsi };
        const updatedMataKuliah = await MataKuliah.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        res.json({ message: 'Mata kuliah berhasil diperbarui', data: updatedMataKuliah });
    } catch (error) {
        console.error("Error saat memperbarui mata kuliah:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Dosen atau Admin: Mendapatkan semua submission untuk satu mata kuliah
exports.getAllSubmissionsByMataKuliah = async (req, res) => {
    try {
        const { id: mataKuliahId } = req.params;
        const user = req.user;

        if (!mongoose.Types.ObjectId.isValid(mataKuliahId)) {
            return res.status(400).json({ message: 'Format ID mata kuliah tidak valid.' });
        }
        
        const mataKuliah = await MataKuliah.findById(mataKuliahId);
        if (!mataKuliah) {
            return res.status(404).json({ message: 'Mata kuliah tidak ditemukan' });
        }

        const isOwner = mataKuliah.dosenId.toString() === user.id;
        const isAdmin = user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Akses ditolak.' });
        }

        const tugasIds = await Tugas.find({ mataKuliahId }).select('_id');
        const kuisIds = await Kuis.find({ mataKuliahId }).select('_id');

        const submissions = await Submission.find({
            $or: [
                { tugasId: { $in: tugasIds.map(t => t._id) } },
                { kuisId: { $in: kuisIds.map(k => k._id) } }
            ]
        });
        
        res.json(submissions);
    } catch (error) {
        console.error("Error fetching all submissions for a course:", error);
        res.status(500).json({ message: 'Server error' });
    }
};