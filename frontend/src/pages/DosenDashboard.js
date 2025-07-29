import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    Container, Typography, Box, CircularProgress, Grid, Card, CardContent,
    Button, Dialog, DialogTitle, DialogContent, TextField,
    DialogActions, Alert, Avatar, Stack, Chip, Paper, Grow,
    List, ListItemAvatar, ListItemText, ListItemButton, IconButton, Divider,
    Snackbar, Zoom
} from '@mui/material';
import {
    School, Add, Group, Assignment, Close, MenuBook, Edit,
    CalendarToday, AccessTime, TrendingDown, EmojiEvents, Quiz, Star
} from '@mui/icons-material';
import GreetingBubble from '../components/GreetingBubble'; // Impor komponen terpisah
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const WavingHand = () => <Box component="span" sx={{ display: 'inline-block', transformOrigin: '70% 70%', animation: 'wave-animation 2.5s 1', '@keyframes wave-animation': { '0%':{transform:'rotate(0.0deg)'},'10%':{transform:'rotate(14.0deg)'},'20%':{transform:'rotate(-8.0deg)'},'30%':{transform:'rotate(14.0deg)'},'40%':{transform:'rotate(-4.0deg)'},'50%':{transform:'rotate(10.0deg)'},'60%':{transform:'rotate(0.0deg)'},'100%':{transform:'rotate(0.0deg)'} } }}>👋</Box>;

const WelcomeBanner = ({ user, currentDateTime, onCreateClick }) => (
    <Card sx={{ mb: 4, position: 'relative', color: 'common.white', p: { xs: 2, sm: 3, md: 4 }, borderRadius: 2 }}>
        <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: 'url(https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1740)', backgroundSize: 'cover', backgroundPosition: 'center', filter: (theme) => `brightness(${theme.palette.mode === 'dark' ? '0.5' : '0.6'})`, zIndex: 1, borderRadius: 'inherit', transition: 'filter 0.3s ease-in-out' }}/>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" spacing={2} sx={{ position: 'relative', zIndex: 2 }}>
            <Box>
                <Typography variant="h4" fontWeight="bold">Halo, {user?.nama} <WavingHand /></Typography>
                <Typography sx={{ opacity: 0.9, mb: 1 }}>Selamat datang kembali di dashboard analitik Anda.</Typography>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ opacity: 0.8 }}>
                    <CalendarToday sx={{ fontSize: '1rem' }} />
                    <Typography variant="body2">{currentDateTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</Typography>
                    <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.5)' }} />
                    <AccessTime sx={{ fontSize: '1rem' }} />
                    <Typography variant="body2">{currentDateTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</Typography>
                </Stack>
            </Box>
            <Button variant="contained" size="large" color="secondary" startIcon={<Add />} onClick={onCreateClick}>Buat Mata Kuliah</Button>
        </Stack>
    </Card>
);

const StatItem = ({ icon, value, label, color }) => (
    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Avatar sx={{ mx: 'auto', mb: 1, bgcolor: `${color}.lighter`, color: `${color}.main` }}>{icon}</Avatar>
        <Typography variant="h6" fontWeight="bold">{value}</Typography>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
    </Paper>
);

const ScoreDistributionChart = ({ data }) => {
    const COLORS = { A: '#4caf50', B: '#81c784', C: '#ffc107', D: '#ff9800', E: '#f44336' };
    return (
        <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <XAxis dataKey="grade" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip cursor={{fill: 'rgba(206, 206, 206, 0.2)'}} />
                <Bar dataKey="count" name="Jumlah Mahasiswa">
                    {data.map((entry) => <Cell key={`cell-${entry.grade}`} fill={COLORS[entry.grade]} />)}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

const StudentPerformanceList = ({ students, title, icon, color }) => (
    <Box>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Avatar sx={{ bgcolor: `${color}.lighter`, color: `${color}.main`, width: 28, height: 28 }}>{icon}</Avatar>
            <Typography variant="subtitle1" fontWeight="bold">{title}</Typography>
        </Stack>
        <List dense>
            {students.map(student => (
                <ListItemButton key={student.id} sx={{ pl: 0 }}>
                    <ListItemText primary={student.nama} secondary={`Rata-rata: ${student.avgScore.toFixed(1)}`} />
                </ListItemButton>
            ))}
        </List>
    </Box>
);

const CourseAnalyticsDetail = ({ data }) => {
    if (!data) {
        return (
            <Paper sx={{ p: 4, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <MenuBook sx={{ fontSize: 60, color: 'text.disabled' }}/>
                <Typography variant="h6" color="text.secondary" mt={2}>Pilih Mata Kuliah</Typography>
                <Typography color="text.secondary">Pilih mata kuliah dari daftar untuk melihat analitik detail.</Typography>
            </Paper>
        );
    }
    return (
        <Grow in={true}>
            <Stack spacing={3}>
                <Typography variant="h5" fontWeight={600}>Analitik untuk: {data.courseName}</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}><StatItem icon={<Group />} value={data.studentCount} label="Mahasiswa" color="primary" /></Grid>
                    <Grid item xs={6} sm={3}><StatItem icon={<Assignment />} value={data.avgTugas.toFixed(1)} label="Avg. Tugas" color="info" /></Grid>
                    <Grid item xs={6} sm={3}><StatItem icon={<Quiz />} value={data.avgKuis.toFixed(1)} label="Avg. Kuis" color="secondary" /></Grid>
                    <Grid item xs={6} sm={3}><StatItem icon={<Star />} value={data.overallAvg.toFixed(1)} label="Avg. Total" color="success" /></Grid>
                </Grid>
                <Paper variant="outlined">
                    <CardContent>
                        <Typography variant="h6" gutterBottom>Distribusi Nilai Akhir</Typography>
                        <ScoreDistributionChart data={data.scoreDistribution} />
                    </CardContent>
                </Paper>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}><StudentPerformanceList students={data.topPerformers} title="Performa Terbaik" icon={<EmojiEvents />} color="success" /></Grid>
                    <Grid item xs={12} md={6}><StudentPerformanceList students={data.bottomPerformers} title="Perlu Perhatian" icon={<TrendingDown />} color="warning" /></Grid>
                </Grid>
            </Stack>
        </Grow>
    );
};

const MataKuliahDialog = ({ open, onClose, onSuccess, course }) => {
    const isEditMode = Boolean(course);
    const [formData, setFormData] = useState({ nama: '', kode: '', deskripsi: '' });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isEditMode && course) {
            setFormData({ nama: course.nama, kode: course.kode, deskripsi: course.deskripsi || '' });
        } else {
            setFormData({ nama: '', kode: '', deskripsi: '' });
        }
    }, [course, isEditMode, open]);

    const handleChange = (field) => (e) => setFormData(prev => ({ ...prev, [field]: e.target.value }));

    const handleClose = () => {
        setError('');
        onClose();
    };

    const handleSubmit = async () => {
        if (!formData.nama || !formData.kode) {
            return setError('Nama dan Kode wajib diisi');
        }
        setSubmitting(true);
        setError('');
        try {
            const res = isEditMode
                ? await api.put(`/matakuliah/${course._id}`, formData)
                : await api.post('/matakuliah', formData);

            onSuccess(isEditMode ? res.data.data : res.data);
            handleClose();
        } catch (err) {
            setError(err.response?.data?.message || `Gagal ${isEditMode ? 'memperbarui' : 'membuat'} mata kuliah.`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">{isEditMode ? 'Edit Mata Kuliah' : 'Mata Kuliah Baru'}</Typography>
                    <IconButton onClick={handleClose}><Close /></IconButton>
                </Stack>
            </DialogTitle>
            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <TextField autoFocus margin="dense" label="Nama Mata Kuliah" fullWidth value={formData.nama} onChange={handleChange('nama')} sx={{ mb: 2 }}/>
                <TextField margin="dense" label="Kode" placeholder="IF-101" fullWidth value={formData.kode} onChange={handleChange('kode')} sx={{ mb: 2 }}/>
                <TextField margin="dense" label="Deskripsi" fullWidth multiline rows={3} value={formData.deskripsi} onChange={handleChange('deskripsi')}/>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={handleClose} variant="outlined">Batal</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={submitting} startIcon={submitting ? <CircularProgress size={16}/> : (isEditMode ? <Edit /> : <Add />)}>
                    {submitting ? (isEditMode ? 'Menyimpan...' : 'Membuat...') : (isEditMode ? 'Simpan Perubahan' : 'Buat')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const DosenDashboard = () => {
    const [courses, setCourses] = useState([]);
    const [allTugas, setAllTugas] = useState([]);
    const [allKuis, setAllKuis] = useState([]);
    const [allSubmissions, setAllSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogState, setDialogState] = useState({ open: false, course: null });
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [showGreeting, setShowGreeting] = useState(true);

    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const courseRes = await api.get('/matakuliah/dosen');
                const fetchedCourses = courseRes.data;
                setCourses(fetchedCourses);

                if (fetchedCourses.length > 0) {
                    if (!selectedCourseId) {
                        setSelectedCourseId(fetchedCourses[0]._id);
                    }
                    const courseIds = fetchedCourses.map(c => c._id);
                    const [tugasRes, kuisRes, subsRes] = await Promise.all([
                        Promise.all(courseIds.map(id => api.get(`/tugas/matakuliah/${id}`))),
                        Promise.all(courseIds.map(id => api.get(`/kuis/matakuliah/${id}`))),
                        Promise.all(courseIds.map(id => api.get(`/matakuliah/${id}/submissions`)))
                    ]);
                    setAllTugas(tugasRes.flatMap(res => res.data));
                    setAllKuis(kuisRes.flatMap(res => res.data));
                    setAllSubmissions(subsRes.flatMap(res => res.data));
                }
            } catch(err) {
                console.error("Error fetching dashboard data:", err);
                showNotification("Gagal memuat data dashboard.", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user, selectedCourseId]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const showNotification = (message, severity = 'success') => setNotification({ open: true, message, severity });

    const handleDialogSuccess = (course) => {
        const isEdit = dialogState.course != null;
        if (isEdit) {
            setCourses(prev => prev.map(c => c._id === course._id ? course : c));
        } else {
            const fetchCourses = async () => {
                const courseRes = await api.get('/matakuliah/dosen');
                setCourses(courseRes.data);
            };
            fetchCourses();
        }
        showNotification(`Mata kuliah "${course.nama}" berhasil ${isEdit ? 'diperbarui' : 'dibuat'}!`);
    };

    const analyticsData = useMemo(() => {
        if (!selectedCourseId || courses.length === 0) return null;

        const course = courses.find(c => c._id === selectedCourseId);
        if (!course) return null;

        const courseTugasIds = new Set(allTugas.filter(t => t.mataKuliahId === selectedCourseId).map(t => t._id));
        const courseKuisIds = new Set(allKuis.filter(k => k.mataKuliahId === selectedCourseId).map(k => k._id));
        const courseSubmissions = allSubmissions.filter(s => courseTugasIds.has(s.tugasId) || courseKuisIds.has(s.kuisId));

        const gradedSubmissionsByStudent = courseSubmissions.reduce((acc, sub) => {
            if (sub.status === 'dinilai') {
                (acc[sub.mahasiswaId] = acc[sub.mahasiswaId] || []).push(sub);
            }
            return acc;
        }, {});

        const studentScores = course.mahasiswaIds.map(mhs => {
            const subs = gradedSubmissionsByStudent[mhs._id] || [];
            const total = subs.reduce((sum, s) => sum + (s.nilai ?? s.skor), 0);
            return { id: mhs._id, nama: mhs.nama, avgScore: subs.length > 0 ? total / subs.length : 0 };
        }).sort((a, b) => b.avgScore - a.avgScore);

        const getGrade = (score) => {
            if (score >= 86) return 'A'; if (score >= 70) return 'B';
            if (score >= 60) return 'C'; if (score >= 50) return 'D';
            return 'E';
        };

        const scoreDistribution = studentScores.reduce((acc, student) => {
            const grade = getGrade(student.avgScore);
            acc[grade]++;
            return acc;
        }, {A:0, B:0, C:0, D:0, E:0});

        const gradedSubs = Object.values(gradedSubmissionsByStudent).flat();
        const avgTugasSubs = gradedSubs.filter(s => s.tugasId && s.nilai != null);
        const avgKuisSubs = gradedSubs.filter(s => s.kuisId && s.skor != null);

        return {
            courseName: course.nama,
            studentCount: course.mahasiswaIds.length,
            avgTugas: avgTugasSubs.length > 0 ? avgTugasSubs.reduce((sum, s) => sum + s.nilai, 0) / avgTugasSubs.length : 0,
            avgKuis: avgKuisSubs.length > 0 ? avgKuisSubs.reduce((sum, s) => sum + s.skor, 0) / avgKuisSubs.length : 0,
            overallAvg: studentScores.length > 0 ? studentScores.reduce((sum, s) => sum + s.avgScore, 0) / studentScores.length : 0,
            scoreDistribution: Object.entries(scoreDistribution).map(([grade, count]) => ({ grade, count })),
            topPerformers: studentScores.slice(0, 3),
            bottomPerformers: studentScores.slice(-3).reverse(),
        };
    }, [selectedCourseId, courses, allTugas, allKuis, allSubmissions]);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress size={60}/></Box>;

    return (
        <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 } }}>
            <WelcomeBanner user={user} currentDateTime={currentDateTime} onCreateClick={() => setDialogState({ open: true, course: null })} />
            <Grid container spacing={3}>
                <Grid item xs={12} md={4} lg={3}>
                    <Paper sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>Mata Kuliah Anda</Typography>
                        {courses.length > 0 ? (
                            <List component="nav" dense>
                                {courses.map((course) => (
                                    <ListItemButton key={course._id} selected={selectedCourseId === course._id} onClick={() => setSelectedCourseId(course._id)}>
                                        <ListItemAvatar><Avatar><School/></Avatar></ListItemAvatar>
                                        <ListItemText primary={course.nama} secondary={course.kode} />
                                        <IconButton edge="end" onClick={(e) => { e.stopPropagation(); setDialogState({ open: true, course }); }}><Edit fontSize="small" /></IconButton>
                                    </ListItemButton>
                                ))}
                            </List>
                        ) : <Typography variant="body2" color="text.secondary">Belum ada mata kuliah.</Typography>}
                         <Divider sx={{ my: 2 }} />
                        <Button fullWidth startIcon={<MenuBook />} onClick={() => navigate(`/dosen/matakuliah/${selectedCourseId}`)} disabled={!selectedCourseId}>
                            Kelola Detail Mata Kuliah
                        </Button>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={8} lg={9}>
                    <CourseAnalyticsDetail data={analyticsData} />
                </Grid>
            </Grid>
            <MataKuliahDialog
                open={dialogState.open}
                onClose={() => setDialogState({ open: false, course: null })}
                onSuccess={handleDialogSuccess}
                course={dialogState.course}
            />
            {showGreeting && (
                <GreetingBubble 
                    user={user} 
                    onClose={() => setShowGreeting(false)} 
                    role="dosen"
                />
            )}
            <Snackbar open={notification.open} autoHideDuration={5000} onClose={() => setNotification({ ...notification, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert onClose={() => setNotification({ ...notification, open: false })} severity={notification.severity} variant="filled" sx={{ width: '100%' }}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default DosenDashboard;