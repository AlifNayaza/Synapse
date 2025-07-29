import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import api from '../services/api';
import {
    TextField, Button, Container, Typography, Box, Paper, 
    Alert, Link, IconButton, InputAdornment, useTheme, useMediaQuery
} from '@mui/material';
import { 
    Visibility, VisibilityOff, AppRegistration, PersonAdd
} from '@mui/icons-material';

const Register = () => {
    const [form, setForm] = useState({
        nama: '', email: '', password: '', confirmPassword: '', nim: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        if (message.text) setMessage({ text: '', type: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });
        
        if (form.password !== form.confirmPassword) {
            setMessage({ text: 'Password tidak cocok!', type: 'error' });
            return;
        }

        try {
            const { confirmPassword, ...registerData } = form;
            await api.post('/auth/register', registerData);
            setMessage({ text: 'Registrasi berhasil! Mengarahkan ke login...', type: 'success' });
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setMessage({ 
                text: err.response?.data?.message || 'Registrasi gagal. Coba lagi!', 
                type: 'error' 
            });
        }
    };

    const fields = [
        { name: 'nama', label: 'Nama Lengkap', required: true },
        { name: 'nim', label: 'NIM', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { 
            name: 'password', 
            label: 'Password', 
            type: showPassword ? 'text' : 'password',
            required: true,
            InputProps: {
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    </InputAdornment>
                )
            }
        },
        { 
            name: 'confirmPassword', 
            label: 'Konfirmasi Password', 
            type: showConfirmPassword ? 'text' : 'password',
            required: true,
            InputProps: {
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    </InputAdornment>
                )
            }
        }
    ];

    return (
        <Container maxWidth="lg" sx={{ py: 4, minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', position: 'relative' }}>
                {/* Floating Image Background untuk Desktop */}
                {!isMobile && (
                    <>
                        {/* Main floating image */}
                        <Box
                            sx={{
                                position: 'absolute',
                                top: '-50px',
                                right: '10%',
                                width: '300px',
                                height: '400px',
                                borderRadius: '50px',
                                overflow: 'hidden',
                                transform: 'rotate(-15deg)',
                                boxShadow: theme.palette.mode === 'dark' 
                                    ? '0 20px 40px rgba(0,0,0,0.5)' 
                                    : '0 20px 40px rgba(0,0,0,0.15)',
                                zIndex: 0,
                                opacity: 0.9
                            }}
                        >
                            <Box
                                component="img"
                                src="/login.jpg"
                                alt="Register illustration"
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    filter: theme.palette.mode === 'dark' 
                                        ? 'brightness(0.7) contrast(1.1)' 
                                        : 'brightness(1.1) contrast(1.05)',
                                }}
                            />
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.secondary.main}25)`,
                                }}
                            />
                        </Box>

                        {/* Small decorative image */}
                        <Box
                            sx={{
                                position: 'absolute',
                                top: '60%',
                                left: '5%',
                                width: '120px',
                                height: '120px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                transform: 'rotate(25deg)',
                                boxShadow: theme.palette.mode === 'dark' 
                                    ? '0 10px 25px rgba(0,0,0,0.4)' 
                                    : '0 10px 25px rgba(0,0,0,0.1)',
                                zIndex: 0,
                                opacity: 0.7
                            }}
                        >
                            <Box
                                component="img"
                                src="/login.jpg"
                                alt="Decorative"
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    filter: theme.palette.mode === 'dark' 
                                        ? 'brightness(0.6) saturate(1.2)' 
                                        : 'brightness(1.2) saturate(1.1)',
                                }}
                            />
                        </Box>
                    </>
                )}

                {/* Main Form Container */}
                <Paper 
                    elevation={12}
                    sx={{ 
                        position: 'relative',
                        zIndex: 1,
                        maxWidth: isMobile ? '100%' : '500px',
                        mx: 'auto',
                        borderRadius: 4,
                        overflow: 'hidden',
                        background: theme.palette.mode === 'dark' 
                            ? 'linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))' 
                            : 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
                        backdropFilter: 'blur(10px)',
                        border: theme.palette.mode === 'dark' 
                            ? '1px solid rgba(255,255,255,0.1)' 
                            : '1px solid rgba(255,255,255,0.2)'
                    }}
                >
                    {/* Mobile Image Header */}
                    {isMobile && (
                        <Box
                            sx={{
                                position: 'relative',
                                height: '180px',
                                overflow: 'hidden'
                            }}
                        >
                            <Box
                                component="img"
                                src="/login.jpg"
                                alt="Register header"
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    filter: theme.palette.mode === 'dark' 
                                        ? 'brightness(0.7)' 
                                        : 'brightness(1.1)',
                                }}
                            />
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: `linear-gradient(180deg, transparent 0%, ${theme.palette.background.paper}20 100%)`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <PersonAdd 
                                    sx={{ 
                                        fontSize: 60, 
                                        color: 'white',
                                        filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.7))'
                                    }} 
                                />
                            </Box>
                        </Box>
                    )}

                    <Box sx={{ p: isMobile ? 3 : 4 }}>
                        <Box textAlign="center" mb={3}>
                            {!isMobile && (
                                <Box
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: '50%',
                                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mx: 'auto',
                                        mb: 2,
                                        boxShadow: theme.palette.mode === 'dark' 
                                            ? '0 8px 25px rgba(0,0,0,0.4)' 
                                            : '0 8px 25px rgba(0,0,0,0.15)'
                                    }}
                                >
                                    <AppRegistration sx={{ fontSize: 40, color: 'white' }} />
                                </Box>
                            )}
                            <Typography 
                                variant={isMobile ? "h5" : "h4"} 
                                fontWeight="700" 
                                gutterBottom
                                sx={{
                                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}
                            >
                                Bergabung Dengan Kami
                            </Typography>
                            <Typography color="text.secondary" variant="body1">
                                Mulai perjalanan belajar Anda hari ini
                            </Typography>
                        </Box>

                        <Box component="form" onSubmit={handleSubmit}>
                            {message.text && (
                                <Alert 
                                    severity={message.type} 
                                    sx={{ 
                                        mb: 2,
                                        borderRadius: 2,
                                        '& .MuiAlert-icon': {
                                            fontSize: '1.5rem'
                                        }
                                    }}
                                >
                                    {message.text}
                                </Alert>
                            )}

                            <Box display="flex" flexDirection="column" gap={2.5} mb={3}>
                                {fields.map((field) => (
                                    <TextField
                                        key={field.name}
                                        fullWidth
                                        name={field.name}
                                        label={field.label}
                                        type={field.type || 'text'}
                                        value={form[field.name]}
                                        onChange={handleChange}
                                        required={field.required}
                                        InputProps={field.InputProps}
                                        variant="outlined"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-1px)',
                                                    boxShadow: theme.palette.mode === 'dark' 
                                                        ? '0 4px 12px rgba(0,0,0,0.3)' 
                                                        : '0 4px 12px rgba(0,0,0,0.1)'
                                                }
                                            }
                                        }}
                                    />
                                ))}
                            </Box>

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                sx={{ 
                                    py: 1.8, 
                                    mb: 2,
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    fontSize: '1.1rem',
                                    borderRadius: 2,
                                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    boxShadow: theme.palette.mode === 'dark' 
                                        ? '0 8px 25px rgba(0,0,0,0.4)' 
                                        : '0 8px 25px rgba(0,0,0,0.15)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: theme.palette.mode === 'dark' 
                                            ? '0 12px 35px rgba(0,0,0,0.5)' 
                                            : '0 12px 35px rgba(0,0,0,0.2)'
                                    }
                                }}
                            >
                                Daftar Sekarang
                            </Button>

                            <Typography textAlign="center" color="text.secondary">
                                Sudah punya akun?{' '}
                                <Link 
                                    component={RouterLink} 
                                    to="/login" 
                                    fontWeight="600"
                                    sx={{
                                        textDecoration: 'none',
                                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                        backgroundClip: 'text',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        '&:hover': {
                                            textDecoration: 'underline'
                                        }
                                    }}
                                >
                                    Masuk di sini
                                </Link>
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default Register;