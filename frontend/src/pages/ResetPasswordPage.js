import React, { useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { Container, Typography, Box, Paper, TextField, Button, Alert, Link } from '@mui/material';
import api from '../services/api';

const ResetPasswordPage = () => {
    const { resetToken } = useParams();
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Password baru tidak cocok.');
            return;
        }
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const res = await api.post(`/auth/reset-password/${resetToken}`, { newPassword });
            setMessage(res.data.message);
            setTimeout(() => navigate('/login'), 3000); // Redirect ke login setelah 3 detik
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal mereset password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs" sx={{ py: 8 }}>
            <Paper sx={{ p: 4 }}>
                <Typography component="h1" variant="h5" align="center" gutterBottom>Reset Password</Typography>
                <Typography align="center" color="text.secondary" sx={{ mb: 3 }}>
                    Masukkan password baru Anda.
                </Typography>
                {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <Box component="form" onSubmit={handleSubmit}>
                    <TextField label="Password Baru" type="password" fullWidth required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} sx={{ mb: 2 }} />
                    <TextField label="Konfirmasi Password Baru" type="password" fullWidth required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>
                        {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default ResetPasswordPage;