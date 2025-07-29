import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

const ProtectedRoute = ({ children, role }) => {
    const { user, loading } = useContext(AuthContext);
    const location = useLocation();

    // Tampilkan loading saat auth context masih memproses
    if (loading) {
        return (
            <Box 
                sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '100vh',
                    gap: 2
                }}
            >
                <CircularProgress size={60} />
                <Typography variant="body1" color="text.secondary">
                    Memverifikasi sesi...
                </Typography>
            </Box>
        );
    }

    // Jika user tidak ada, redirect ke login dengan menyimpan intended path
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Jika role diperlukan dan tidak sesuai, redirect ke dashboard yang benar
    if (role && user.role !== role) {
        return <Navigate to={`/${user.role}/dashboard`} replace />;
    }

    return children;
};

export default ProtectedRoute;