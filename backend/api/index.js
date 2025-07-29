// backend/api/index.js

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

// --- CORS Configuration for Vercel ---
// VERCEL_URL is a system environment variable provided by Vercel
const FRONTEND_URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
const allowedOrigins = ['http://localhost:3000', FRONTEND_URL];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error(`Not allowed by CORS: ${origin}`));
        }
    },
    credentials: true,
};

app.use(cors(corsOptions));

// --- Middleware Setup (MUST be before routes) ---
app.use(cookieParser());
app.use(express.json()); // Essential for parsing POST request bodies

// Serve static files from a 'public' or 'uploads' folder if needed
// Note: Vercel's ephemeral filesystem means uploaded files are not permanent
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// --- Database Connection ---
// Ensure the connection is established only once
if (!mongoose.connection.readyState) {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log('Connected to MongoDB Atlas'))
        .catch(err => console.error('Failed to connect to MongoDB:', err));
}

// --- Route Definitions ---
// Corrected paths relative to this file's location inside 'api'
const authRoutes = require('./routes/auth');
const tugasRoutes = require('./routes/tugas');
const kuisRoutes = require('./routes/kuis');
const mahasiswaRoutes = require('./routes/mahasiswa');
const matakuliahRoutes = require('./routes/matakuliah');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');

// Apply routes with the '/api' prefix
app.use('/api/auth', authRoutes);
app.use('/api/tugas', tugasRoutes);
app.use('/api/kuis', kuisRoutes);
app.use('/api/mahasiswa', mahasiswaRoutes);
app.use('/api/matakuliah', matakuliahRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// --- Socket.IO Setup (Vercel does not support traditional WebSockets on the Hobby plan) ---
// This setup might not work as expected on Vercel's free tier.
// Long-polling will be used as a fallback.
const io = new Server(server, {
    cors: corsOptions,
    path: "/socket.io" // Important for Vercel routing
});

io.on('connection', (socket) => {
    console.log('User connected via Socket.IO:', socket.id);
    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);
    });
    // Add other event listeners here
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

app.set('socketio', io);

// This part is for local development. Vercel handles the server lifecycle.
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running locally on http://localhost:${PORT}`);
    });
}

// --- EXPORT FOR VERCEL ---
// This is the most crucial part for Vercel to handle all requests.
module.exports = app;