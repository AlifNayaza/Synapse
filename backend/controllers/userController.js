const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Mendapatkan profil pengguna yang sedang login
exports.getUserProfile = async (req, res) => {
    try {
        // req.user.id didapatkan dari middleware proteksi token JWT
        const user = await User.findById(req.user.id).select('-password'); // Jangan kirim password
        if (!user) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Memperbarui profil pengguna (hanya nama)
exports.updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
        }

        user.nama = req.body.nama || user.nama;
        // Email tidak diizinkan untuk diubah untuk menjaga konsistensi
        
        const updatedUser = await user.save();
        
        res.json({
            _id: updatedUser._id,
            nama: updatedUser.nama,
            email: updatedUser.email,
            role: updatedUser.role,
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Mengubah password pengguna
exports.changeUserPassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Password lama dan baru harus diisi' });
    }

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
        }

        // Cek apakah password lama cocok
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Password lama salah' });
        }

        // Enkripsi password baru
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: 'Password berhasil diubah' });

    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};