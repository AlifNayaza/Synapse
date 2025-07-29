import React, { useState } from 'react';
import { Container, Typography, Box, Paper, TextField, Button, Alert, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import api from '../services/api';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const res = await api.post('/auth/forgot-password', { email });
            setMessage(res.data.message);
        } catch (err) {
            setError('Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs" sx={{ py: 8 }}>
            <Paper sx={{ p: 4 }}>
                <Typography component="h1" variant="h5" align="center" gutterBottom>Lupa Password</Typography>
                <Typography align="center" color="text.secondary" sx={{ mb: 3 }}>
                    Masukkan alamat email Anda dan kami akan mengirimkan link untuk mereset password.
                </Typography>
                {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <Box component="form" onSubmit={handleSubmit}>
                    <TextField label="Alamat Email" type="email" fullWidth required value={email} onChange={(e) => setEmail(e.target.value)} />
                    <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>
                        {loading ? 'Mengirim...' : 'Kirim Link Reset'}
                    </Button>
                    <Box textAlign="center">
                        <Link component={RouterLink} to="/login">Kembali ke Login</Link>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default ForgotPasswordPage;