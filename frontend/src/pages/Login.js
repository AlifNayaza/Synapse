import React, { useState, useContext } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
    Container, Paper, TextField, Button, Typography, Box,
    Alert, CircularProgress, InputAdornment, IconButton, Divider, Grid, useTheme,
    alpha, FormControlLabel, Checkbox, FormHelperText
} from '@mui/material';
import {
    Email, Lock, Visibility, VisibilityOff,
    School, Login as LoginIcon
} from '@mui/icons-material';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: true,
    });
    
    const [showPassword, setShowPassword] = useState(false);
    const [capsLockOn, setCapsLockOn] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { user, login } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();

    if (user) {
        const intendedPath = location.state?.from?.pathname;
        const defaultPath = `/${user.role}/dashboard`;
        return <Navigate to={intendedPath || defaultPath} replace />;
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // --- UPDATED handleSubmit FUNCTION ---
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            setError('Email dan password harus diisi');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // The `login` function from context should handle the API call
            const result = await login(formData);

            if (result && result.success) {
                // On success, AuthContext sets the user state.
                // We can then navigate.
                const intendedPath = location.state?.from?.pathname;
                const loggedInUser = result.user;
                const defaultPath = `/${loggedInUser.role}/dashboard`;
                navigate(intendedPath || defaultPath, { replace: true });
            } else {
                // If login function returns a failure message, display it.
                setError(result.message || 'Email atau password salah.');
            }
        } catch (err) {
            // This catch block is a fallback.
            // It will catch errors if the `login` function itself throws an error,
            // or if the API call fails in an unexpected way.
            setError(err.response?.data?.message || err.message || 'Terjadi kesalahan saat login.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{
            minHeight: '100vh', height: '100vh', width: '100vw', display: 'flex',
            position: 'fixed', top: 0, left: 0, overflow: 'hidden',
            backgroundImage: 'url("/login.jpg")', backgroundSize: 'cover',
            backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed',
            '&::before': {
                content: '""', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: theme.palette.mode === 'dark' 
                    ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)'
                    : 'linear-gradient(135deg, rgba(99, 102, 241, 0.8) 0%, rgba(168, 85, 247, 0.7) 100%)',
                backdropFilter: 'blur(2px)', zIndex: 1
            }
        }}>
            <Container maxWidth="lg" sx={{ 
                position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center',
                py: 4, height: '100vh', overflow: 'auto'
            }}>
                <Grid container spacing={0} sx={{ minHeight: '80vh' }}>
                    <Grid item xs={12} md={6} sx={{ 
                        display: { xs: 'none', md: 'flex' }, flexDirection: 'column',
                        justifyContent: 'center', alignItems: 'center', color: 'white',
                        textAlign: 'center', px: 4
                    }}>
                        <School sx={{ fontSize: { xs: 60, md: 80 }, mb: 3, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }} />
                        <Typography variant="h2" fontWeight="bold" gutterBottom sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)', fontSize: { md: '2.5rem', lg: '3rem' } }}>
                            Platform Belajar
                        </Typography>
                        <Typography variant="h5" sx={{ opacity: 0.9, maxWidth: 400, textShadow: '0 1px 2px rgba(0,0,0,0.3)', fontWeight: 300 }}>
                            Bergabunglah dengan ribuan mahasiswa dalam perjalanan belajar yang menginspirasi
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', px: { xs: 2, sm: 4 } }}>
                        <Paper elevation={0} sx={{ 
                            p: { xs: 3, sm: 4 }, width: '100%', maxWidth: 440,
                            backgroundColor: alpha(theme.palette.background.paper, 0.95), backdropFilter: 'blur(20px)',
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, borderRadius: 3,
                            boxShadow: theme.palette.mode === 'dark' 
                                ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                                : '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                        }}>
                            <Box sx={{ textAlign: 'center', mb: 4, display: { xs: 'block', md: 'none' } }}>
                                <School sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                            </Box>
                            <Box sx={{ textAlign: 'center', mb: 4 }}>
                                <Typography variant="h4" fontWeight="bold" gutterBottom sx={{
                                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
                                }}>
                                    Selamat Datang Kembali
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ opacity: 0.8 }}>
                                    Masuk untuk melanjutkan pembelajaran Anda
                                </Typography>
                            </Box>
                            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2, border: 'none' }}>{error}</Alert>}
                            <form onSubmit={handleSubmit}>
                                <TextField
                                    fullWidth
                                    autoFocus
                                    name="email"
                                    type="email"
                                    label="Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={loading}
                                    sx={{ mb: 3 }}
                                    InputProps={{
                                        startAdornment: (<InputAdornment position="start"><Email color="action" /></InputAdornment>)
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    label="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={loading}
                                    sx={{ mb: 1 }}
                                    onKeyUp={(e) => setCapsLockOn(e.getModifierState('CapsLock'))}
                                    InputProps={{
                                        startAdornment: (<InputAdornment position="start"><Lock color="action" /></InputAdornment>),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" tabIndex={-1}>
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                                {capsLockOn && (
                                    <FormHelperText error sx={{ ml: 1, mb: 1 }}>
                                        Peringatan: Caps Lock aktif
                                    </FormHelperText>
                                )}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, mt: 1 }}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="rememberMe"
                                                checked={formData.rememberMe}
                                                onChange={handleChange}
                                                disabled={loading}
                                                size="small"
                                            />
                                        }
                                        label={<Typography variant="body2">Ingat saya</Typography>}
                                    />
                                    <Button
                                        variant="text" size="small"
                                        onClick={() => navigate('/forgot-password')}
                                        sx={{ textTransform: 'none', fontSize: '0.875rem' }}
                                    >
                                        Lupa Password?
                                    </Button>
                                </Box>
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    disabled={loading}
                                    startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
                                    sx={{ 
                                        mb: 3, py: 1.5,
                                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                                        '&:hover': { background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})` }
                                    }}
                                >
                                    {loading ? 'Memproses...' : 'Masuk'}
                                </Button>
                            </form>
                            <Divider sx={{ my: 3 }}><Typography variant="body2" color="text.secondary">atau</Typography></Divider>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Belum punya akun?{' '}
                                    <Button
                                        variant="text"
                                        onClick={() => navigate('/register')}
                                        sx={{ p: 0, textTransform: 'none', fontWeight: 600, color: 'primary.main' }}
                                    >
                                        Daftar sebagai Mahasiswa
                                    </Button>
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default Login;