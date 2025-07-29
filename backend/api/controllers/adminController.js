const User = require('../api/models/User');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const MataKuliah = require('../api/models/MataKuliah');
const Tugas = require('../api/models/Tugas');
const Kuis = require('../api/models/Kuis');
const Submission = require('../api/models/Submission');

// Admin: Membuat akun Dosen baru
exports.createDosen = async (req, res) => {
    const { nama, email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'Email sudah digunakan untuk akun lain' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newDosen = new User({
            nama,
            email,
            password: hashedPassword,
            role: 'dosen'
        });

        await newDosen.save();

        // --- Kirim event real-time ---
        const io = req.app.get('socketio');
        io.emit('dataChanged', { reason: 'Admin created a new lecturer' });

        res.status(201).json({ message: `Akun dosen untuk ${nama} berhasil dibuat.` });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Admin: Mendapatkan daftar semua pengguna (kecuali admin lain)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: 'admin' } }).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Admin: Menghapus pengguna (Dosen atau Mahasiswa)
exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const userToDelete = await User.findById(userId);

        if (!userToDelete) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
        }
        
        if (userToDelete.role === 'admin') {
            return res.status(400).json({ message: 'Tidak dapat menghapus akun admin.' });
        }

        if (userToDelete.role === 'dosen') {
            const mataKuliahs = await MataKuliah.find({ dosenId: userId });
            const mataKuliahIds = mataKuliahs.map(mk => mk._id);
            const tugasIds = await Tugas.find({ mataKuliahId: { $in: mataKuliahIds } }).select('_id');
            const kuisIds = await Kuis.find({ mataKuliahId: { $in: mataKuliahIds } }).select('_id');
            const submissions = await Submission.find({ tugasId: { $in: tugasIds.map(t => t._id) } });

            submissions.forEach(sub => {
                if (sub.fileUrl) {
                    const filePath = path.join(__dirname, '../..', sub.fileUrl);
                    fs.unlink(filePath, (err) => {
                        if (err) console.error(`Gagal menghapus file: ${filePath}`, err);
                    });
                }
            });

            await Submission.deleteMany({
                $or: [
                    { tugasId: { $in: tugasIds.map(t => t._id) } },
                    { kuisId: { $in: kuisIds.map(k => k._id) } }
                ]
            });
            await Tugas.deleteMany({ mataKuliahId: { $in: mataKuliahIds } });
            await Kuis.deleteMany({ mataKuliahId: { $in: mataKuliahIds } });
            await MataKuliah.deleteMany({ dosenId: userId });

        } else if (userToDelete.role === 'mahasiswa') {
            const submissions = await Submission.find({ mahasiswaId: userId });
            submissions.forEach(sub => {
                 if (sub.fileUrl) {
                    const filePath = path.join(__dirname, '../..', sub.fileUrl);
                    fs.unlink(filePath, (err) => {
                        if (err) console.error(`Gagal menghapus file: ${filePath}`, err);
                    });
                }
            });
            await Submission.deleteMany({ mahasiswaId: userId });
            await MataKuliah.updateMany(
                { mahasiswaIds: userId },
                { $pull: { mahasiswaIds: userId } }
            );
        }

        await User.findByIdAndDelete(userId);

        // --- Kirim event real-time ---
        const io = req.app.get('socketio');
        io.emit('dataChanged', { reason: 'Admin deleted a user' });
        
        res.json({ message: `Pengguna ${userToDelete.nama} dan semua data terkait berhasil dihapus.` });

    } catch (error) {
        console.error("Error saat menghapus pengguna:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Admin: Mendapatkan statistik global
exports.getGlobalStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
        const totalMataKuliah = await MataKuliah.countDocuments();
        const totalTugas = await Tugas.countDocuments();
        const totalKuis = await Kuis.countDocuments();
        
        res.json({
            users: totalUsers,
            mataKuliah: totalMataKuliah,
            aktivitas: totalTugas + totalKuis,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Admin: Memperbarui data Mata Kuliah
exports.updateMataKuliah = async (req, res) => {
    const { mataKuliahId } = req.params;
    const { nama, kode, deskripsi, dosenId } = req.body;

    try {
        let mataKuliah = await MataKuliah.findById(mataKuliahId);
        if (!mataKuliah) {
            return res.status(404).json({ message: 'Mata kuliah tidak ditemukan' });
        }

        if (kode && kode !== mataKuliah.kode) {
            const kodeExists = await MataKuliah.findOne({ kode, _id: { $ne: mataKuliahId } });
            if (kodeExists) {
                return res.status(400).json({ message: 'Kode mata kuliah sudah digunakan' });
            }
        }
        
        if (dosenId && dosenId.toString() !== mataKuliah.dosenId.toString()) {
             const dosenExists = await User.findOne({ _id: dosenId, role: 'dosen' });
             if (!dosenExists) {
                 return res.status(404).json({ message: 'Dosen dengan ID tersebut tidak ditemukan atau bukan dosen' });
             }
        }

        const updateFields = {};
        if (nama) updateFields.nama = nama;
        if (kode) updateFields.kode = kode;
        if (deskripsi) updateFields.deskripsi = deskripsi;
        if (dosenId) updateFields.dosenId = dosenId;

        const updatedMataKuliah = await MataKuliah.findByIdAndUpdate(
            mataKuliahId,
            { $set: updateFields },
            { new: true, runValidators: true }
        ).populate('dosenId', 'nama email');

        // --- Kirim event real-time ---
        const io = req.app.get('socketio');
        io.emit('dataChanged', { reason: 'Admin updated a course' });

        res.json({ message: 'Data mata kuliah berhasil diperbarui', data: updatedMataKuliah });

    } catch (error) {
        console.error("Error saat memperbarui mata kuliah:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Admin: Menghapus mata kuliah
exports.deleteMataKuliah = async (req, res) => {
    try {
        const { mataKuliahId } = req.params;

        const mataKuliah = await MataKuliah.findById(mataKuliahId);
        if (!mataKuliah) {
            return res.status(404).json({ message: 'Mata kuliah tidak ditemukan' });
        }

        const tugasIds = await Tugas.find({ mataKuliahId }).select('_id');
        const kuisIds = await Kuis.find({ mataKuliahId }).select('_id');
        const submissions = await Submission.find({ tugasId: { $in: tugasIds.map(t => t._id) } });

        submissions.forEach(sub => {
            if (sub.fileUrl) {
                const filePath = path.join(__dirname, '../..', sub.fileUrl);
                fs.unlink(filePath, (err) => {
                    if (err) console.error(`Gagal menghapus file: ${filePath}`, err);
                });
            }
        });

        await Submission.deleteMany({
            $or: [
                { tugasId: { $in: tugasIds.map(t => t._id) } },
                { kuisId: { $in: kuisIds.map(k => k._id) } }
            ]
        });
        await Tugas.deleteMany({ mataKuliahId });
        await Kuis.deleteMany({ mataKuliahId });
        await MataKuliah.findByIdAndDelete(mataKuliahId);

        // --- Kirim event real-time ---
        const io = req.app.get('socketio');
        io.emit('dataChanged', { reason: 'Admin deleted a course' });

        res.json({ message: `Mata kuliah "${mataKuliah.nama}" dan semua data terkaitnya berhasil dihapus.` });

    } catch (error) {
        console.error("Error saat menghapus mata kuliah:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- FUNGSI BARU UNTUK BULK DELETE ---
exports.deleteMultipleUsers = async (req, res) => {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ message: 'Daftar ID pengguna tidak valid.' });
    }

    let deletedCount = 0;
    const errors = [];

    // Loop melalui setiap ID dan gunakan logika penghapusan yang sudah ada
    for (const userId of userIds) {
        try {
            const userToDelete = await User.findById(userId);
            if (!userToDelete || userToDelete.role === 'admin') {
                errors.push(`Gagal memproses ID: ${userId} (pengguna tidak ditemukan atau adalah admin).`);
                continue; // Lanjut ke ID berikutnya
            }

            // Logika cascade delete yang sama seperti di deleteUser
            if (userToDelete.role === 'dosen') {
                const mataKuliahs = await MataKuliah.find({ dosenId: userId });
                const mataKuliahIds = mataKuliahs.map(mk => mk._id);
                const tugasIds = await Tugas.find({ mataKuliahId: { $in: mataKuliahIds } }).select('_id');
                const kuisIds = await Kuis.find({ mataKuliahId: { $in: mataKuliahIds } }).select('_id');
                const submissions = await Submission.find({ tugasId: { $in: tugasIds.map(t => t._id) } });
                submissions.forEach(sub => {
                    if (sub.fileUrl) fs.unlink(path.join(__dirname, '../..', sub.fileUrl), () => {});
                });
                await Submission.deleteMany({ $or: [{ tugasId: { $in: tugasIds.map(t => t._id) } }, { kuisId: { $in: kuisIds.map(k => k._id) } }] });
                await Tugas.deleteMany({ mataKuliahId: { $in: mataKuliahIds } });
                await Kuis.deleteMany({ mataKuliahId: { $in: mataKuliahIds } });
                await MataKuliah.deleteMany({ dosenId: userId });
            } else if (userToDelete.role === 'mahasiswa') {
                const submissions = await Submission.find({ mahasiswaId: userId });
                submissions.forEach(sub => {
                    if (sub.fileUrl) fs.unlink(path.join(__dirname, '../..', sub.fileUrl), () => {});
                });
                await Submission.deleteMany({ mahasiswaId: userId });
                await MataKuliah.updateMany({ mahasiswaIds: userId }, { $pull: { mahasiswaIds: userId } });
            }

            await User.findByIdAndDelete(userId);
            deletedCount++;
        } catch (error) {
            console.error(`Error saat menghapus pengguna dengan ID ${userId}:`, error);
            errors.push(`Terjadi error saat menghapus pengguna dengan ID ${userId}.`);
        }
    }

    // Kirim event real-time SEKALI setelah semua selesai
    if (deletedCount > 0) {
        const io = req.app.get('socketio');
        io.emit('dataChanged', { reason: 'Admin deleted multiple users' });
    }

    if (errors.length > 0) {
        return res.status(207).json({ // 207 Multi-Status
            message: `Selesai: ${deletedCount} pengguna berhasil dihapus, ${errors.length} gagal.`,
            errors
        });
    }

    res.json({ message: `${deletedCount} pengguna berhasil dihapus.` });
};