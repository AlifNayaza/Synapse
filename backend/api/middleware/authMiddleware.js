// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // Menambahkan data user dari token ke request
            // Pastikan payload token Anda konsisten (misal: { id, role, nama })
            req.user = decoded;
            next();
        } catch (error) {
            // Jika token tidak valid (misal: kadaluarsa, rusak), kirim 401
            // Frontend Axios interceptor akan menangani refresh di sini
            console.error("Authentication error: Token invalid or expired.", error.message);
            res.status(401).json({ message: 'Token tidak valid atau kadaluarsa.' });
        }
    } else {
        res.status(401).json({ message: 'Tidak ada token, akses ditolak.' });
    }
};

const isDosen = (req, res, next) => {
    // Pastikan req.user sudah ada dari middleware `protect`
    if (req.user && req.user.role === 'dosen') {
        next();
    } else {
        res.status(403).json({ message: 'Akses ditolak, hanya untuk dosen.' });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Akses ditolak, hanya untuk admin.' });
    }
};

module.exports = { protect, isDosen, isAdmin };