// src/context/AuthContext.js

import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Fungsi login: lebih jelas mengembalikan data user untuk redirect
    const login = useCallback(async (credentials) => {
        try {
            // 'rememberMe' tidak lagi dikirim
            const res = await api.post('/auth/login', credentials);
            const { user: userData, accessToken } = res.data;

            localStorage.setItem('accessToken', accessToken);
            
            // Perbarui header default Axios untuk request selanjutnya dalam sesi ini
            api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

            setUser(userData);
            setIsAuthenticated(true);
            // Kembalikan data agar komponen pemanggil bisa melakukan tindakan (misal: redirect)
            return { success: true, user: userData }; 
        } catch (err) {
            console.error("AuthContext: Login gagal:", err.response?.data?.message || err.message);
            return { success: false, message: err.response?.data?.message || 'Login gagal.' };
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await api.post('/auth/logout');
        } catch (err) {
            console.error("AuthContext: Logout gagal di server:", err);
        } finally {
            localStorage.removeItem('accessToken');
            // Hapus header Authorization dari instance Axios
            delete api.defaults.headers.common['Authorization'];
            setUser(null);
            setIsAuthenticated(false);
        }
    }, []);

    // Fungsi inisialisasi otentikasi
    const initializeAuth = useCallback(async () => {
        setLoading(true);
        const accessToken = localStorage.getItem('accessToken');

        if (accessToken) {
            try {
                // Coba verifikasi token dengan mengambil data user.
                const res = await api.get('/auth/me');
                const userData = res.data.user;
                
                setUser(userData);
                setIsAuthenticated(true);
            } catch (error) {
                // Jika /auth/me gagal (karena token kedaluwarsa/tidak valid),
                // alur refresh token sudah tidak ada. Jadi, langsung logout.
                console.error("AuthContext: Sesi tidak valid. Membersihkan...");
                localStorage.removeItem('accessToken');
                setUser(null);
                setIsAuthenticated(false);
            }
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    const authContextValue = useMemo(() => ({
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        // register, // Jika Anda punya fungsi register, jangan lupa dimasukkan
    }), [user, isAuthenticated, loading, login, logout]);

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};