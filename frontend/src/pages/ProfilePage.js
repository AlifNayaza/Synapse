import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import {
    Container, Typography, Box, CircularProgress, Alert,
    Button, TextField, Grid, Avatar, Stack,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Card, CardContent, IconButton, useTheme, useMediaQuery,
    Tabs, Tab, Divider
} from '@mui/material';
import { 
    Person, Lock, Edit, Visibility, VisibilityOff, Save, Cancel, Shield
} from '@mui/icons-material';

const ProfilePage = () => {
    const { user: authUser, login } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tabValue, setTabValue] = useState(0);
    const [editOpen, setEditOpen] = useState(false);
    const [nama, setNama] = useState('');
    const [updating, setUpdating] = useState(false);
    const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showPasswords, setShowPasswords] = useState({ old: false, new: false, confirm: false });

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isDark = theme.palette.mode === 'dark';

    useEffect(() => {
        api.get('/users/profile')
            .then(res => {
                setProfile(res.data);
                setNama(res.data.nama);
            })
            .catch(() => setError('Gagal memuat profil.'))
            .finally(() => setLoading(false));
    }, []);

    const handlePasswordSubmit = async () => {
        const { old: oldPassword, new: newPassword, confirm: confirmPassword } = passwords;
        
        if (newPassword !== confirmPassword) {
            setPasswordError('Password baru tidak cocok.');
            return;
        }
        if (newPassword.length < 6) {
            setPasswordError('Password baru harus minimal 6 karakter.');
            return;
        }

        setPasswordError('');
        setPasswordSuccess('');
        setSubmitting(true);

        try {
            const res = await api.put('/users/password', { oldPassword, newPassword });
            setPasswordSuccess(res.data.message);
            setPasswords({ old: '', new: '', confirm: '' });
            setShowPasswords({ old: false, new: false, confirm: false });
        } catch (err) {
            setPasswordError(err.response?.data?.message || 'Gagal mengubah password.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateProfile = async () => {
        if (!nama.trim()) return;
        
        setUpdating(true);
        try {
            await api.put('/users/profile', { nama: nama.trim() });
            setProfile(prev => ({ ...prev, nama: nama.trim() }));
            login({ ...authUser, nama: nama.trim() }, localStorage.getItem('token'));
            setEditOpen(false);
        } catch (err) {
            console.error("Gagal update profil:", err);
        } finally {
            setUpdating(false);
        }
    };

    const PasswordField = ({ label, field, helperText }) => (
        <TextField 
            label={label}
            type={showPasswords[field] ? "text" : "password"}
            fullWidth 
            value={passwords[field]}
            onChange={e => setPasswords(prev => ({ ...prev, [field]: e.target.value }))}
            helperText={helperText}
            size="small"
            sx={{
                '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    '&:hover': {
                        bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                    }
                }
            }}
            InputProps={{
                endAdornment: (
                    <IconButton
                        onClick={() => setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))}
                        edge="end"
                        size="small"
                        sx={{ mr: 0.5 }}
                    >
                        {showPasswords[field] ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                )
            }}
        />
    );

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="sm" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>
            </Container>
        );
    }

    const gradientBg = `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.secondary.main}15)`;
    const cardSx = {
        borderRadius: 4,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.08)',
        backdropFilter: 'blur(10px)',
        bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)'
    };

    return (
        <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 } }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Avatar sx={{ 
                    width: { xs: 80, md: 100 }, 
                    height: { xs: 80, md: 100 }, 
                    fontSize: { xs: '2rem', md: '2.5rem' },
                    margin: 'auto', mb: 2,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.15)'
                }}>
                    {profile?.nama.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="h4" fontWeight="600" gutterBottom>
                    {profile?.nama}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                    {profile?.email}
                </Typography>
                <Box sx={{
                    display: 'inline-flex',
                    px: 2, py: 0.5,
                    borderRadius: 20,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`,
                    border: `1px solid ${theme.palette.primary.main}30`
                }}>
                    <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: 1 }}>
                        {profile?.role}
                    </Typography>
                </Box>
            </Box>

            {/* Main Card */}
            <Card sx={cardSx}>
                <Box sx={{ background: gradientBg, borderRadius: '16px 16px 0 0' }}>
                    <Tabs 
                        value={tabValue} 
                        onChange={(e, v) => setTabValue(v)}
                        centered={!isMobile}
                        variant={isMobile ? "fullWidth" : "standard"}
                        sx={{
                            '& .MuiTab-root': {
                                textTransform: 'none',
                                fontWeight: 600,
                                minHeight: 64,
                                fontSize: '0.9rem'
                            }
                        }}
                    >
                        <Tab icon={<Person />} label="Profil" iconPosition="start" />
                        <Tab icon={<Shield />} label="Keamanan" iconPosition="start" />
                    </Tabs>
                </Box>

                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    {/* Profile Tab */}
                    {tabValue === 0 && (
                        <Box sx={{ textAlign: 'center', py: 2 }}>
                            <Typography variant="h6" gutterBottom color="text.secondary">
                                Informasi Profil
                            </Typography>
                            <Stack spacing={2} sx={{ maxWidth: 300, mx: 'auto', mt: 3 }}>
                                <Box sx={{
                                    p: 2, borderRadius: 3,
                                    bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
                                }}>
                                    <Typography variant="caption" color="text.secondary">Nama Lengkap</Typography>
                                    <Typography variant="body1" fontWeight="500">{profile?.nama}</Typography>
                                </Box>
                                <Box sx={{
                                    p: 2, borderRadius: 3,
                                    bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
                                }}>
                                    <Typography variant="caption" color="text.secondary">Email</Typography>
                                    <Typography variant="body1" fontWeight="500">{profile?.email}</Typography>
                                </Box>
                                <Button 
                                    variant="contained" 
                                    startIcon={<Edit />} 
                                    onClick={() => setEditOpen(true)}
                                    sx={{ 
                                        borderRadius: 3, py: 1.2, mt: 2,
                                        textTransform: 'none', fontWeight: 600,
                                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                                    }}
                                >
                                    Edit Profil
                                </Button>
                            </Stack>
                        </Box>
                    )}

                    {/* Security Tab */}
                    {tabValue === 1 && (
                        <Box>
                            <Typography variant="h6" gutterBottom sx={{ mb: 3, textAlign: 'center' }} color="text.secondary">
                                Ubah Password
                            </Typography>
                            
                            <Stack spacing={2.5} sx={{ maxWidth: 400, mx: 'auto' }}>
                                {passwordError && <Alert severity="error" sx={{ borderRadius: 3 }}>{passwordError}</Alert>}
                                {passwordSuccess && <Alert severity="success" sx={{ borderRadius: 3 }}>{passwordSuccess}</Alert>}
                                
                                <PasswordField label="Password Lama" field="old" />
                                <PasswordField label="Password Baru" field="new" helperText="Minimal 6 karakter" />
                                <PasswordField label="Konfirmasi Password" field="confirm" />
                                
                                <Button 
                                    onClick={handlePasswordSubmit} 
                                    variant="contained" 
                                    disabled={submitting || !passwords.old || !passwords.new || !passwords.confirm}
                                    startIcon={submitting ? <CircularProgress size={20} /> : <Save />}
                                    sx={{ 
                                        borderRadius: 3, py: 1.2, mt: 2,
                                        textTransform: 'none', fontWeight: 600,
                                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                                    }}
                                >
                                    {submitting ? 'Menyimpan...' : 'Simpan Password'}
                                </Button>
                            </Stack>
                        </Box>
                    )}
                </CardContent>
            </Card>
            
            {/* Edit Dialog */}
            <Dialog 
                open={editOpen} 
                onClose={() => { setEditOpen(false); setNama(profile?.nama || ''); }}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { 
                        borderRadius: 4,
                        bgcolor: isDark ? 'rgba(18,18,18,0.95)' : 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(20px)'
                    }
                }}
            >
                <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
                    <Person color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h5" fontWeight="600">Edit Profil</Typography>
                </DialogTitle>
                
                <DialogContent sx={{ px: 3 }}>
                    <TextField
                        autoFocus
                        label="Nama Lengkap"
                        fullWidth
                        value={nama}
                        onChange={(e) => setNama(e.target.value)}
                        margin="normal"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 3,
                                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
                            }
                        }}
                    />
                </DialogContent>
                
                <DialogActions sx={{ p: 3, gap: 1, justifyContent: 'center' }}>
                    <Button 
                        onClick={() => { setEditOpen(false); setNama(profile?.nama || ''); }}
                        startIcon={<Cancel />}
                        sx={{ borderRadius: 3, textTransform: 'none', px: 3 }}
                    >
                        Batal
                    </Button>
                    <Button 
                        onClick={handleUpdateProfile} 
                        variant="contained"
                        disabled={updating || !nama.trim() || nama.trim() === profile?.nama}
                        startIcon={updating ? <CircularProgress size={16} /> : <Save />}
                        sx={{ 
                            borderRadius: 3, textTransform: 'none', fontWeight: 600, px: 3,
                            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                        }}
                    >
                        {updating ? 'Menyimpan...' : 'Simpan'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ProfilePage;