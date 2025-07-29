// backend/api/index.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

// --- Konfigurasi CORS ---
const FRONTEND_URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
const allowedOrigins = ['http://localhost:3000', FRONTEND_URL, 'https://synapse-five.vercel.app'];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error(`Origin ${origin} tidak diizinkan oleh CORS`));
        }
    },
    credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// --- Middleware ---
app.use(cookieParser());
app.use(express.json());

// --- Koneksi Database ---
if (mongoose.connection.readyState === 0) {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log('Terhubung ke MongoDB Atlas'))
        .catch(err => console.error('Gagal terhubung ke MongoDB:', err));
}

// --- Pemuatan Rute dengan Error Handling ---
try {
    console.log("Memuat rute...");

    // Pastikan path ini benar relatif terhadap 'api/index.js'
    const authRoutes = require('./routes/auth');
    const tugasRoutes = require('./routes/tugas');
    const kuisRoutes = require('./routes/kuis');
    const mahasiswaRoutes = require('./routes/mahasiswa');
    const matakuliahRoutes = require('./routes/matakuliah');
    const userRoutes = require('./routes/user'); // File yang Anda berikan
    const adminRoutes = require('./routes/admin');
    
    console.log("Semua file rute berhasil diimpor.");

    // Terapkan rute dengan prefix yang benar
    app.use('/api/auth', authRoutes);
    app.use('/api/tugas', tugasRoutes);
    app.use('/api/kuis', kuisRoutes);
    app.use('/api/mahasiswa', mahasiswaRoutes);
    app.use('/api/matakuliah', matakuliahRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/admin', adminRoutes);

    console.log("Semua rute berhasil diterapkan.");

} catch (e) {
    console.error("GAGAL MEMUAT RUTE:", e);
    // Jika error terjadi di sini, itu berarti salah satu file rute Anda
    // memiliki kesalahan sintaks atau masalah ekspor.
    // Error ini akan menghentikan aplikasi.
    process.exit(1); 
}


// Rute dasar untuk mengecek apakah API berjalan
app.get('/api', (req, res) => {
    res.status(200).send('API Platform Belajar sedang berjalan dengan baik.');
});

// --- PENTING: Ekspor aplikasi untuk Vercel ---
module.exports = app;