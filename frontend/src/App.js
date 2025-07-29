import React, { useEffect, useContext, useMemo } from 'react';
// 1. Impor `useLocation` dari react-router-dom
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { io } from 'socket.io-client';

// Impor Komponen Material UI & Ikon
import { Box, Fab, Zoom, useScrollTrigger, CssBaseline } from '@mui/material';
import { KeyboardArrowUp as KeyboardArrowUpIcon } from '@mui/icons-material';

// Impor Komponen & Halaman
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import DosenDashboard from './pages/DosenDashboard';
import MahasiswaDashboard from './pages/MahasiswaDashboard';
import MataKuliahDetailMahasiswa from './pages/MataKuliahDetailMahasiswa';
import KuisPage from './pages/KuisPage';
import TugasDetailDosen from './pages/TugasDetailDosen';
import KuisDetailDosen from './pages/KuisDetailDosen';
import KuisDetailMahasiswa from './pages/KuisDetailMahasiswa';
import TugasDetailMahasiswa from './pages/TugasDetailMahasiswa';
import MataKuliahDetailDosen from './pages/MataKuliahDetailDosen';
import ProfilePage from './pages/ProfilePage';
import HelpPage from './pages/HelpPage';
import GlossaryPage from './pages/GlossaryPage';
import AdminDashboard from './pages/AdminDashboard';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

const ScrollTop = ({ children }) => {
    const trigger = useScrollTrigger({
        disableHysteresis: true,
        threshold: 100,
    });

    const handleClick = (event) => {
        const anchor = (event.target.ownerDocument || document).querySelector('#back-to-top-anchor');
        if (anchor) {
            anchor.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    return (
        <Zoom in={trigger}>
            <Box onClick={handleClick} role="presentation" sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1100 }}>
                {children}
            </Box>
        </Zoom>
    );
};

// 2. Pindahkan logika utama ke komponen ini agar bisa menggunakan `useLocation`
function AppLayout({ socket }) {
    const { user } = useContext(AuthContext);
    const location = useLocation(); // Dapatkan lokasi saat ini

    useEffect(() => {
        if (user && socket) {
            socket.emit('joinRoom', user.id);
            if (user.role === 'admin') {
                socket.emit('joinRoom', 'admin-room');
            }
        }
    }, [user, socket]);

    // 3. Definisikan path mana saja yang tidak akan menampilkan Navbar & Footer
    // Kita menggunakan regex untuk menangani path dengan parameter seperti :resetToken
    const authPaths = ['/login', '/register', '/forgot-password', /^\/reset-password\/.+/];
    
    // Cek apakah path saat ini cocok dengan salah satu path otentikasi
    const isAuthPage = authPaths.some(path => 
        typeof path === 'string' 
        ? path === location.pathname 
        : path.test(location.pathname)
    );

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <CssBaseline />
            {/* 4. Render Navbar hanya jika BUKAN halaman otentikasi */}
            {!isAuthPage && <Navbar />}

            <div id="back-to-top-anchor" />
            
            {/* Wrapper main content tidak perlu diubah */}
            <Box component="main" sx={{ 
                flexGrow: 1, 
                // Hapus padding jika ini adalah halaman login/register agar full-screen
                py: isAuthPage ? 0 : { xs: 2, md: 4 } 
            }}>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/help" element={<HelpPage />} />
                    <Route path="/glossary" element={<GlossaryPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password/:resetToken" element={<ResetPasswordPage />} />
                    
                    <Route path="/" element={user ? <Navigate to={`/${user.role}/dashboard`} /> : <Navigate to="/login" />} />

                    <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard socket={socket} /></ProtectedRoute>} />

                    <Route path="/dosen/dashboard" element={<ProtectedRoute role="dosen"><DosenDashboard socket={socket} /></ProtectedRoute>} />
                    <Route path="/dosen/matakuliah/:id" element={<ProtectedRoute role="dosen"><MataKuliahDetailDosen socket={socket} /></ProtectedRoute>} />
                    <Route path="/dosen/tugas/:id" element={<ProtectedRoute role="dosen"><TugasDetailDosen socket={socket} /></ProtectedRoute>} />
                    <Route path="/dosen/kuis/:id" element={<ProtectedRoute role="dosen"><KuisDetailDosen socket={socket} /></ProtectedRoute>} />
                    
                    <Route path="/mahasiswa/dashboard" element={<ProtectedRoute role="mahasiswa"><MahasiswaDashboard socket={socket} /></ProtectedRoute>} />
                    <Route path="/mahasiswa/matakuliah/:id" element={<ProtectedRoute role="mahasiswa"><MataKuliahDetailMahasiswa socket={socket} /></ProtectedRoute>} />
                    <Route path="/tugas/:id" element={<ProtectedRoute role="mahasiswa"><TugasDetailMahasiswa socket={socket} /></ProtectedRoute>} />
                    <Route path="/kuis/:id" element={<ProtectedRoute role="mahasiswa"><KuisPage /></ProtectedRoute>} />
                    <Route path="/kuis/:id/hasil" element={<ProtectedRoute role="mahasiswa"><KuisDetailMahasiswa socket={socket} /></ProtectedRoute>} />
                    
                    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </Box>

            {/* 5. Render Footer hanya jika BUKAN halaman otentikasi */}
            {!isAuthPage && <Footer />}
            
            <ScrollTop>
                <Fab color="secondary" size="small" aria-label="scroll back to top">
                    <KeyboardArrowUpIcon />
                </Fab>
            </ScrollTop>
        </Box>
    );
}

// Komponen AppContent dan AppWrapper tidak perlu diubah secara signifikan,
// tetapi kita akan merapikannya sedikit.
const AppContent = () => {
    // Logika socket tetap di sini
    const socket = useMemo(() => io('http://localhost:5000', {
        auth: { token: localStorage.getItem('token') }
    }), []);

    useEffect(() => {
        if (!socket.connected) socket.connect();
        return () => { socket.disconnect(); };
    }, [socket]);

    // Kita akan menggunakan Router di sini agar AppLayout bisa memakai useLocation
    return (
        <Router>
            <AppLayout socket={socket} />
        </Router>
    );
};

const AppWrapper = () => (
    <AuthProvider>
        <ThemeProvider>
            <AppContent />
        </ThemeProvider>
    </AuthProvider>
);

export default AppWrapper;