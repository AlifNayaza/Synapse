// backend/controllers/authController.js

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer =require('nodemailer');

// --- Helper Functions ---

/**
 * Membuat Access Token JWT.
 * Berumur pendek (1 menit untuk tes, 3 jam untuk produksi).
 * Berisi payload untuk identifikasi user di setiap request.
 */
const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user.id, role: user.role, nama: user.nama },
        process.env.JWT_SECRET,
        { expiresIn: '3h' } // Sengaja dibuat pendek untuk menguji fungsi refresh
    );
};

/**
 * Membuat Refresh Token JWT.
 * Berumur panjang (7 hari).
 * Berisi payload minimalis untuk mendapatkan access token baru.
 * Menyertakan 'tokenVersion' untuk mekanisme invalidasi sesi.
 */
const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user.id, tokenVersion: user.tokenVersion },
        process.env.JWT_SECRET, // Untuk keamanan lebih, bisa gunakan secret berbeda (JWT_REFRESH_SECRET)
        { expiresIn: '7d' }
    );
};


// --- Controller Functions ---

exports.register = async (req, res) => {
    const { nama, email, password, nim } = req.body;
    try {
        let userByEmail = await User.findOne({ email });
        if (userByEmail) {
            return res.status(400).json({ message: 'Email sudah terdaftar' });
        }

        let userByNim = await User.findOne({ nim });
        if (userByNim) {
            return res.status(400).json({ message: 'NIM sudah terdaftar' });
        }

        // Hashing password ditangani oleh pre-save hook di model User.js
        const newUser = new User({
            nama, email, password, nim, role: 'mahasiswa'
        });
        await newUser.save();

        const io = req.app.get('socketio');
        io.emit('dataChanged', { reason: 'A new student has registered' });

        res.status(201).json({ message: 'Registrasi sebagai mahasiswa berhasil' });
    } catch (error) {
        console.error("Error in register:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.login = async (req, res) => {
    const { email, password, rememberMe } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Email atau password salah' });
        }

        const accessToken = generateAccessToken(user);

        // Jika "Ingat Saya" dicentang, set cookie refresh token
        if (rememberMe) {
            const refreshToken = generateRefreshToken(user);
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true, // Tidak bisa diakses oleh JavaScript frontend
                secure: process.env.NODE_ENV === 'production', // Hanya lewat HTTPS di produksi
                sameSite: 'Lax', // Pengamanan terhadap CSRF
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
                path: '/api/auth' // Pastikan path konsisten
            });
        } else {
            // Jika tidak, pastikan cookie lama (jika ada) dibersihkan
            res.clearCookie('refreshToken', { path: '/api/auth' });
        }

        res.json({
            accessToken: accessToken,
            user: { id: user.id, role: user.role, nama: user.nama }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.refresh = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ message: 'Akses ditolak. Tidak ada refresh token.' });
    }

    try {
        // 1. Verifikasi tanda tangan dan masa berlaku refresh token
        const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);

        // 2. Cari user di database
        const user = await User.findById(payload.id);
        if (!user) {
            return res.status(403).json({ message: 'User tidak ditemukan.' });
        }

        // 3. KRUSIAL: Verifikasi versi token. Jika tidak cocok, sesi ini sudah tidak valid.
        if (user.tokenVersion !== payload.tokenVersion) {
            res.clearCookie('refreshToken', { path: '/api/auth' });
            return res.status(403).json({ message: 'Refresh token tidak valid (sesi dibatalkan).' });
        }

        // 4. Jika semua valid, buat access token baru dan kirimkan
        const newAccessToken = generateAccessToken(user);
        res.json({ accessToken: newAccessToken, user: { id: user.id, role: user.role, nama: user.nama } });

    } catch (error) {
        // Ini terjadi jika jwt.verify gagal (misal, token kedaluwarsa atau rusak)
        console.error("Refresh token error:", error.message);
        res.clearCookie('refreshToken', { path: '/api/auth' });
        return res.status(403).json({ message: 'Refresh token tidak valid atau kedaluwarsa.' });
    }
};

exports.logout = async (req, res) => {
    // Dengan metode JWT, logout hanya perlu menghapus cookie di sisi client.
    // Tidak perlu interaksi database.
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        path: '/api/auth'
    });
    res.status(200).json({ message: 'Logout berhasil' });
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            // Selalu kembalikan pesan yang sama untuk keamanan, mencegah user enumeration.
            return res.json({ message: 'Jika email terdaftar, link reset password telah dikirim.' });
        }

        const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Reset Password Akun Platform Belajar',
            html: `<p>Halo ${user.nama},</p><p>Anda menerima email ini karena ada permintaan untuk mereset password akun Anda.</p><p>Silakan klik link di bawah ini untuk melanjutkan:</p><a href="${resetUrl}" style="background-color: #f57c00; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a><p>Link ini hanya berlaku selama 15 menit.</p><p>Jika Anda tidak merasa meminta ini, abaikan saja email ini.</p>`
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: 'Jika email terdaftar, link reset password telah dikirim.' });
    } catch (error) {
        console.error("Error in forgotPassword:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.resetPassword = async (req, res) => {
    const { resetToken } = req.params;
    const { newPassword } = req.body;
    try {
        const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(400).json({ message: 'Token tidak valid atau pengguna tidak ditemukan.' });
        }
        
        user.password = newPassword; // Pre-save hook akan hash otomatis
        
        // KRUSIAL: Tingkatkan versi token untuk membatalkan semua sesi login lama
        user.tokenVersion += 1;
        
        await user.save();
        res.json({ message: 'Password berhasil direset. Anda akan diminta login ulang di semua perangkat.' });
    } catch (error) {
        console.error("Error in resetPassword:", error);
        res.status(400).json({ message: 'Token tidak valid atau telah kedaluwarsa.' });
    }
};

exports.me = async (req, res) => {
    try {
        // req.user disuntikkan oleh middleware 'protect' dari token akses
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Tidak terotentikasi.' });
        }
        // Ambil data user dari DB tanpa password
        const user = await User.findById(req.user.id).select('-password -tokenVersion');
        if (!user) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
        }
        res.json({ user: { id: user.id, role: user.role, nama: user.nama, email: user.email } });
    } catch (error) {
        console.error("Error in /auth/me:", error);
        res.status(500).json({ message: 'Server error' });
    }
};
