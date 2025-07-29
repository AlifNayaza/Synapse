// backend/index.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
    'http://localhost:3000', // Frontend URL
    // 'http://localhost:5000' // Ini tidak perlu di allowedOrigins jika backend tidak diakses langsung dari browser di port 5000, kecuali untuk keperluan debugging API secara langsung.
];

const corsOptions = {
    origin: function (origin, callback) {
        // Izinkan permintaan tanpa origin (misal: dari aplikasi seluler, Postman, file://)
        // ATAU izinkan jika origin ada dalam daftar allowedOrigins
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error(`Not allowed by CORS: ${origin}`)); // Beri info origin yang ditolak
        }
    },
    credentials: true, // INI PENTING: Izinkan pengiriman cookies dan header otorisasi
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Tambahkan metode yang diperlukan
    allowedHeaders: ['Content-Type', 'Authorization'], // Header yang diizinkan
};

const io = new Server(server, {
    cors: corsOptions // Konfigurasi CORS untuk Socket.IO
});

app.use(cors(corsOptions)); // Konfigurasi CORS untuk Express HTTP routes
app.use(cookieParser()); // Middleware untuk parse cookies
app.use(express.json()); // Middleware untuk parse body JSON
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Terhubung ke MongoDB Atlas'))
    .catch(err => console.error('Gagal terhubung ke MongoDB:', err));

// Routes
// app.use('/api/auth', require('./routes/auth')); // Contoh rute autentikasi
// Pastikan rute ini dimuat setelah CORS dan cookieParser
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes); // Pastikan ini adalah prefix rute /api/auth

app.use('/api/tugas', require('./routes/tugas'));
app.use('/api/kuis', require('./routes/kuis'));
app.use('/api/mahasiswa', require('./routes/mahasiswa'));
app.use('/api/matakuliah', require('./routes/matakuliah'));
app.use('/api/users', require('./routes/user'));
app.use('/api/admin', require('./routes/admin'));

// Socket.IO Connection
io.on('connection', (socket) => {
    console.log('Pengguna terhubung:', socket.id);

    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);
    });

    socket.on('leaveRoom', (roomId) => {
        socket.leave(roomId);
        console.log(`User ${socket.id} left room ${roomId}`);
    });

    socket.on('joinCourseRoom', (courseId) => {
        socket.join(courseId);
        console.log(`User ${socket.id} joined course room ${courseId}`);
    });

    socket.on('leaveCourseRoom', (courseId) => {
        socket.leave(courseId);
        console.log(`User ${socket.id} left course room ${courseId}`);
    });

    socket.on('disconnect', () => {
        console.log('Pengguna terputus:', socket.id);
    });
});

app.set('socketio', io); // Set io instance ke app object

const PORT = process.env.PORT || 5000;
// server.listen(PORT, 'localhost', () => { // Hapus 'localhost' jika Anda ingin server bisa diakses dari IP lain di jaringan lokal
server.listen(PORT, () => { // Lebih fleksibel, akan mendengarkan di semua interface
    console.log(`Server berjalan di http://localhost:${PORT}`);
});