// backend/api/index.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Inisialisasi aplikasi Express
const app = express();

// --- Konfigurasi CORS ---
// VERCEL_URL adalah variabel sistem yang disediakan oleh Vercel
const FRONTEND_URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
const allowedOrigins = ['http://localhost:3000', FRONTEND_URL, 'https://synapse-five.vercel.app']; // Tambahkan URL spesifik Anda sebagai fallback

const corsOptions = {
    origin: function (origin, callback) {
        // Izinkan request jika origin ada dalam daftar atau jika origin tidak ada (seperti dari Postman)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error(`Origin ${origin} tidak diizinkan oleh CORS`));
        }
    },
    credentials: true,
};

app.use(cors(corsOptions));
// Menangani pre-flight request untuk semua rute
app.options('*', cors(corsOptions));

// --- Middleware ---
app.use(cookieParser());
app.use(express.json()); // Penting untuk request POST

// --- Koneksi Database ---
// Pastikan koneksi hanya dibuat sekali
if (mongoose.connection.readyState === 0) {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log('Terhubung ke MongoDB Atlas'))
        .catch(err => console.error('Gagal terhubung ke MongoDB:', err));
}

// --- Definisi Rute ---
// Path relatif dari file ini
const authRoutes = require('./routes/auth');
const tugasRoutes = require('./routes/tugas');
const kuisRoutes = require('./routes/kuis');
const mahasiswaRoutes = require('./routes/mahasiswa');
const matakuliahRoutes = require('./routes/matakuliah');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');

// Terapkan rute dengan prefix '/api'
app.use('/api/auth', authRoutes);
app.use('/api/tugas', tugasRoutes);
app.use('/api/kuis', kuisRoutes);
app.use('/api/mahasiswa', mahasiswaRoutes);
app.use('/api/matakuliah', matakuliahRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Rute dasar untuk mengecek apakah API berjalan
app.get('/api', (req, res) => {
    res.send('API Platform Belajar sedang berjalan.');
});

// --- PENTING: Ekspor aplikasi untuk Vercel ---
// Vercel akan mengambil 'app' ini dan menjalankannya sebagai serverless function.
// Jangan gunakan app.listen() atau server.listen() di sini.
module.exports = app;