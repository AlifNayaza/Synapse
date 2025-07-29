import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    Container, Typography, Box, CircularProgress, Grid, Card, CardContent,
    CardActionArea, Button, Dialog, DialogTitle, DialogContent, TextField,
    List, ListItem, ListItemAvatar, Avatar, ListItemText, Alert, Snackbar, IconButton, Stack,
    Chip, Paper, useMediaQuery, Grow, Fab, Zoom, useScrollTrigger,
    ListItemButton, Divider, DialogActions
} from '@mui/material';
import {
    School, Search, Person, Add, CheckCircle, Close, MenuBook,
    TrendingUp, Schedule, Star, Assignment, Quiz, KeyboardArrowUp,
    CalendarToday, AccessTime
} from '@mui/icons-material';
import GreetingBubble from '../components/GreetingBubble'; // Impor komponen terpisah

const WavingHand = () => (
    <Box
        component="span"
        sx={{
            display: 'inline-block',
            transformOrigin: '70% 70%',
            animation: 'wave-animation 2.5s 1',
            '@keyframes wave-animation': {
                '0%': { transform: 'rotate(0.0deg)' }, '10%': { transform: 'rotate(14.0deg)' },
                '20%': { transform: 'rotate(-8.0deg)' }, '30%': { transform: 'rotate(14.0deg)' },
                '40%': { transform: 'rotate(-4.0deg)' }, '50%': { transform: 'rotate(10.0deg)' },
                '60%': { transform: 'rotate(0.0deg)' }, '100%': { transform: 'rotate(0.0deg)' },
            },
        }}
    >
        👋
    </Box>
);

const WelcomeBanner = ({ user, currentDateTime, onBrowseClick }) => (
    <Card sx={{ mb: 4, position: 'relative', color: 'common.white', p: { xs: 2, sm: 3, md: 4 }, borderRadius: 2 }}>
        <Box sx={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            backgroundImage: 'url(https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&w=1740)',
            backgroundSize: 'cover', backgroundPosition: 'center',
            filter: (theme) => `brightness(${theme.palette.mode === 'dark' ? '0.5' : '0.6'})`,
            zIndex: 1, borderRadius: 'inherit',
            transition: 'filter 0.3s ease-in-out'
        }}/>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" spacing={2} sx={{ position: 'relative', zIndex: 2 }}>
            <Box>
                <Typography variant="h4" fontWeight="bold">
                    Selamat Datang, {user?.nama.split(' ')[0]} <WavingHand />
                </Typography>
                <Typography sx={{ opacity: 0.9, mb: 1 }}>Mari kita lihat progres belajarmu hari ini.</Typography>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ opacity: 0.8 }}>
                    <CalendarToday sx={{ fontSize: '1rem' }} />
                    <Typography variant="body2">{currentDateTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</Typography>
                    <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.5)' }} />
                    <AccessTime sx={{ fontSize: '1rem' }} />
                    <Typography variant="body2">{currentDateTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</Typography>
                </Stack>
            </Box>
            <Button variant="contained" size="large" color="secondary" startIcon={<Search />} onClick={onBrowseClick}>
                Cari Mata Kuliah
            </Button>
        </Stack>
    </Card>
);

const StatCard = ({ icon, value, label, color }) => (
    <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, height: '100%' }}>
        <Avatar sx={{ bgcolor: `${color}.lighter`, color: `${color}.main`, width: 48, height: 48 }}>{icon}</Avatar>
        <Box>
            <Typography variant="h4" fontWeight="bold">{value}</Typography>
            <Typography color="text.secondary">{label}</Typography>
        </Box>
    </Paper>
);

const ModernCourseCard = ({ course, avgTugas, avgKuis, onClick, index }) => (
    <Grow in timeout={300 + index * 100}>
        <Card elevation={3} sx={{ cursor: 'pointer', transition: 'all 0.3s ease', '&:hover': { transform: { sm: 'scale(1.02)' }, boxShadow: { sm: 8 } } }}>
            <CardActionArea onClick={onClick}>
                <Box sx={{ background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`, height: { xs: 60, sm: 80 }, position: 'relative', overflow: 'hidden' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: { xs: 1.5, sm: 2 }, height: '100%' }}>
                        <Typography variant="h6" color="white" fontWeight={600} noWrap>{course.kode}</Typography>
                        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}><School/></Avatar>
                    </Stack>
                </Box>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom noWrap>{course.nama}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: 40, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {course.deskripsi || 'Tidak ada deskripsi'}
                    </Typography>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ flexWrap: 'wrap', gap: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Person fontSize="small" color="action" /><Typography variant="body2" noWrap>{course.dosenId.nama}</Typography>
                        </Stack>
                        <Stack direction="row" spacing={1}>
                            <Chip icon={<Assignment sx={{ fontSize: 16 }} />} label={avgTugas} size="small" variant="outlined" />
                            <Chip icon={<Quiz sx={{ fontSize: 16 }} />} label={avgKuis} size="small" variant="outlined" />
                        </Stack>
                    </Stack>
                </CardContent>
            </CardActionArea>
        </Card>
    </Grow>
);

const UpcomingActivityItem = ({ activity, mataKuliahMap, navigate }) => {
    const isTugas = activity.type === 'tugas';
    const link = isTugas ? `/tugas/${activity._id}` : `/kuis/${activity._id}`;
    const mataKuliah = mataKuliahMap[activity.mataKuliahId];
    return (
        <ListItemButton onClick={() => navigate(link)} divider>
            <ListItemAvatar><Avatar sx={{ bgcolor: isTugas ? 'primary.lighter' : 'secondary.lighter', color: isTugas ? 'primary.main' : 'secondary.main' }}>
                {isTugas ? <Assignment /> : <Quiz />}
            </Avatar></ListItemAvatar>
            <ListItemText
                primary={<Typography variant="body2" fontWeight={500}>{activity.judul}</Typography>}
                secondary={<Typography variant="caption" color="text.secondary">
                    {mataKuliah?.nama || '...'} • Tenggat: {new Date(activity.tenggat).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}
                </Typography>}
            />
        </ListItemButton>
    );
};

const CourseListItem = ({ course, isEnrolled, onEnroll, enrolling }) => (
    <Paper variant="outlined" sx={{ mb: 1, overflow: 'hidden' }}>
        <Box sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={2} sm={1}>
                    <Avatar sx={{ bgcolor: isEnrolled ? 'success.main' : 'primary.main', width: 40, height: 40 }}>
                        {isEnrolled ? <CheckCircle /> : <School />}
                    </Avatar>
                </Grid>
                <Grid item xs={6} sm={8}>
                    <Typography variant="subtitle1" fontWeight={600} noWrap>{course.nama}</Typography>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                        <Chip label={course.kode} size="small" variant="outlined" />
                        <Typography variant="caption" color="text.secondary">{course.dosenId.nama}</Typography>
                    </Stack>
                </Grid>
                <Grid item xs={4} sm={3}>
                    <Button
                        variant={isEnrolled ? "outlined" : "contained"}
                        onClick={() => onEnroll(course._id)}
                        disabled={isEnrolled || enrolling === course._id}
                        size="small"
                        fullWidth
                        sx={{ minHeight: 36 }}
                    >
                        {enrolling === course._id ? <CircularProgress size={16} /> : isEnrolled ? "Terdaftar" : "Daftar"}
                    </Button>
                </Grid>
            </Grid>
        </Box>
    </Paper>
);

const BrowseMataKuliahDialog = ({ open, onClose, enrolledIds, onEnrollSuccess }) => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [enrolling, setEnrolling] = useState(null);

    useEffect(() => {
        if (open) {
            setLoading(true);
            api.get('/matakuliah')
                .then(res => setCourses(res.data))
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [open]);

    const handleEnroll = async (courseId) => {
        setEnrolling(courseId);
        try {
            const res = await api.post(`/matakuliah/${courseId}/enroll`);
            onEnrollSuccess(res.data.message, courseId);
        } catch (error) {
            console.error(error);
        } finally {
            setEnrolling(null);
        }
    };

    const filteredCourses = useMemo(() =>
        courses.filter(course =>
            course.nama.toLowerCase().includes(search.toLowerCase()) ||
            course.kode.toLowerCase().includes(search.toLowerCase())
        ), [courses, search]
    );

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">Jelajahi Mata Kuliah</Typography>
                    <IconButton onClick={onClose} size="small"><Close /></IconButton>
                </Stack>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 0 }}>
                <Box sx={{ p: 3, pb: 2 }}>
                    <TextField fullWidth placeholder="Cari mata kuliah..." value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} /> }} size="medium" />
                </Box>
                <Divider />
                <Box sx={{ p: 2, maxHeight: '50vh', overflow: 'auto' }}>
                    {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
                    : filteredCourses.length > 0 ? filteredCourses.map((course) => {
                        const isEnrolled = enrolledIds.includes(course._id);
                        return <CourseListItem key={course._id} course={course} isEnrolled={isEnrolled} onEnroll={handleEnroll} enrolling={enrolling} />;
                    })
                    : <Box sx={{ textAlign: 'center', py: 4 }}><Typography color="text.secondary">{search ? 'Tidak ada mata kuliah yang ditemukan' : 'Tidak ada mata kuliah tersedia'}</Typography></Box>}
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}><Button onClick={onClose} variant="outlined">Tutup</Button></DialogActions>
        </Dialog>
    );
};

const EmptyState = ({ onBrowseClick }) => (
    <Paper sx={{ p: 6, textAlign: 'center', bgcolor: 'background.default', border: '2px dashed', borderColor: 'divider' }}>
        <MenuBook sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h5" gutterBottom fontWeight={600}>Mulai Perjalanan Belajar</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>Jelajahi mata kuliah dan mulai pembelajaran berkualitas</Typography>
        <Button variant="contained" size="large" onClick={onBrowseClick} startIcon={<Search />}>Jelajahi Mata Kuliah</Button>
    </Paper>
);

const ScrollTop = ({ children }) => {
    const trigger = useScrollTrigger({ disableHysteresis: true, threshold: 100 });
    const handleClick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    return <Zoom in={trigger}><Box onClick={handleClick} role="presentation" sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1100 }}>{children}</Box></Zoom>;
};


const MahasiswaDashboard = ({ socket }) => {
    const [data, setData] = useState({ mataKuliah: [], allTugas: [], allKuis: [], submissions: [] });
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [notification, setNotification] = useState({ open: false, message: '' });
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const [showGreeting, setShowGreeting] = useState(true);

    const fetchData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [mkRes, subRes] = await Promise.all([
                api.get('/matakuliah/mahasiswa'),
                api.get(`/mahasiswa/submissions/${user.id}`)
            ]);
            const courseIds = mkRes.data.map(c => c._id);
            let allTugas = [], allKuis = [];
            if (courseIds.length > 0) {
                const tugasPromises = courseIds.map(id => api.get(`/tugas/matakuliah/${id}`));
                const kuisPromises = courseIds.map(id => api.get(`/kuis/matakuliah/${id}`));
                const [allTugasRes, allKuisRes] = await Promise.all([Promise.all(tugasPromises), Promise.all(kuisPromises)]);
                allTugas = allTugasRes.flatMap(res => res.data);
                allKuis = allKuisRes.flatMap(res => res.data);
            }
            setData({ mataKuliah: mkRes.data, submissions: subRes.data, allTugas, allKuis });
        } catch (error) {
            console.error("Gagal memuat data dashboard:", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!socket || !user) return;

        const handleSubmissionUpdate = (updatedSubmission) => {
            setData(prev => {
                const newSubmissions = [...prev.submissions];
                const existingIndex = newSubmissions.findIndex(s => s._id === updatedSubmission._id);
                if (existingIndex > -1) {
                    newSubmissions[existingIndex] = updatedSubmission;
                } else {
                    newSubmissions.push(updatedSubmission);
                }
                return { ...prev, submissions: newSubmissions };
            });
        };

        const handleNewActivity = (newActivity, type) => {
            const enrolledCourseIds = new Set(data.mataKuliah.map(mk => mk._id));
            if (enrolledCourseIds.has(newActivity.mataKuliahId)) {
                setData(prev => ({
                    ...prev,
                    [type === 'tugas' ? 'allTugas' : 'allKuis']: [...prev[type === 'tugas' ? 'allTugas' : 'allKuis'], newActivity]
                }));
            }
        };

        socket.on('tugasDinilai', handleSubmissionUpdate);
        socket.on('kuisDinilai', handleSubmissionUpdate);
        socket.on('tugasBaru', (newTugas) => handleNewActivity(newTugas, 'tugas'));
        socket.on('kuisBaru', (newKuis) => handleNewActivity(newKuis, 'kuis'));

        return () => {
            socket.off('tugasDinilai', handleSubmissionUpdate);
            socket.off('kuisDinilai', handleSubmissionUpdate);
            socket.off('tugasBaru');
            socket.off('kuisBaru');
        };
    }, [socket, user, data.mataKuliah]);

    const handleEnrollSuccess = (message) => {
        setNotification({ open: true, message });
        setDialogOpen(false);
        fetchData();
    };

    const enrolledIds = useMemo(() => data.mataKuliah.map(c => c._id), [data.mataKuliah]);

    const stats = useMemo(() => {
        const { allTugas, allKuis, submissions } = data;
        const submittedTugasIds = new Set(submissions.map(s => s.tugasId));
        const submittedKuisIds = new Set(submissions.map(s => s.kuisId));

        const pendingTugas = allTugas.filter(t => !submittedTugasIds.has(t._id) && new Date(t.tenggat) > new Date()).length;
        const pendingKuis = allKuis.filter(k => !submittedKuisIds.has(k._id) && new Date(k.tenggat) > new Date()).length;

        const gradedTugas = submissions.filter(s => s.tugasId && s.status === 'dinilai' && s.nilai != null);
        const gradedKuis = submissions.filter(s => s.kuisId && s.status === 'dinilai' && s.skor != null);

        const totalNilaiTugas = gradedTugas.reduce((sum, sub) => sum + sub.nilai, 0);
        const totalNilaiKuis = gradedKuis.reduce((sum, sub) => sum + sub.skor, 0);

        return {
            pendingActivities: pendingTugas + pendingKuis,
            averageTugasScore: gradedTugas.length > 0 ? Math.round(totalNilaiTugas / gradedTugas.length) : 'N/A',
            averageKuisScore: gradedKuis.length > 0 ? Math.round(totalNilaiKuis / gradedKuis.length) : 'N/A',
        };
    }, [data]);

    const upcomingActivities = useMemo(() => {
        const { allTugas, allKuis, submissions } = data;
        const submittedIds = new Set([...submissions.map(s => s.tugasId), ...submissions.map(s => s.kuisId)]);
        const allActivities = [...allTugas.map(t => ({ ...t, type: 'tugas' })), ...allKuis.map(k => ({ ...k, type: 'kuis' }))];
        return allActivities
            .filter(act => !submittedIds.has(act._id) && new Date(act.tenggat) > new Date())
            .sort((a, b) => new Date(a.tenggat) - new Date(b.tenggat))
            .slice(0, 5);
    }, [data]);

    const mataKuliahMap = useMemo(() => data.mataKuliah.reduce((acc, mk) => ({ ...acc, [mk._id]: mk }), {}), [data.mataKuliah]);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress size={50} /></Box>;

    return (
        <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 } }}>
            <WelcomeBanner user={user} currentDateTime={currentDateTime} onBrowseClick={() => setDialogOpen(true)} />

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}><StatCard icon={<School />} value={data.mataKuliah.length} label="Mata Kuliah Diikuti" color="primary" /></Grid>
                <Grid item xs={12} md={4}><StatCard icon={<Schedule />} value={stats.pendingActivities} label="Aktivitas Belum Selesai" color="warning" /></Grid>
                <Grid item xs={12} md={4}>
                     <Card sx={{ p: 2, height: '100%' }}>
                        <Stack spacing={1} justifyContent="center" height="100%">
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography fontWeight="medium">Avg. Nilai Tugas</Typography>
                                <Chip icon={<Assignment/>} label={stats.averageTugasScore} variant="outlined" size="small"/>
                            </Stack>
                             <Divider/>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography fontWeight="medium">Avg. Nilai Kuis</Typography>
                                <Chip icon={<Quiz/>} label={stats.averageKuisScore} variant="outlined" size="small"/>
                            </Stack>
                        </Stack>
                    </Card>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                    <Paper sx={{ p: { xs: 2, sm: 3 } }}>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Mata Kuliah Saya</Typography>
                        {data.mataKuliah.length > 0 ? (
                            <Grid container spacing={{ xs: 2, sm: 3 }}>
                                {data.mataKuliah.map((course, index) => {
                                    const courseTugasIds = new Set(data.allTugas.filter(t => t.mataKuliahId === course._id).map(t => t._id));
                                    const courseKuisIds = new Set(data.allKuis.filter(k => k.mataKuliahId === course._id).map(k => k._id));
                                    const gradedTugasSubs = data.submissions.filter(s => s.status === 'dinilai' && courseTugasIds.has(s.tugasId));
                                    const gradedKuisSubs = data.submissions.filter(s => s.status === 'dinilai' && courseKuisIds.has(s.kuisId));
                                    const avgTugas = gradedTugasSubs.length > 0 ? Math.round(gradedTugasSubs.reduce((sum, sub) => sum + sub.nilai, 0) / gradedTugasSubs.length) : 'N/A';
                                    const avgKuis = gradedKuisSubs.length > 0 ? Math.round(gradedKuisSubs.reduce((sum, sub) => sum + sub.skor, 0) / gradedKuisSubs.length) : 'N/A';
                                    
                                    return (
                                        <Grid item xs={12} sm={6} key={course._id}>
                                            <ModernCourseCard course={course} avgTugas={avgTugas} avgKuis={avgKuis} index={index} onClick={() => navigate(`/mahasiswa/matakuliah/${course._id}`)}/>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        ) : <EmptyState onBrowseClick={() => setDialogOpen(true)}/>}
                    </Paper>
                </Grid>
                <Grid item xs={12} lg={4}>
                    <Paper sx={{ p: { xs: 2, sm: 3 } }}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>Aktivitas Mendatang</Typography>
                        {upcomingActivities.length > 0 ? (
                            <List dense>{upcomingActivities.map((act) => <UpcomingActivityItem key={act._id} activity={act} mataKuliahMap={mataKuliahMap} navigate={navigate} />)}</List>
                        ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>Tidak ada tugas atau kuis yang akan datang.</Typography>
                        )}
                    </Paper>
                </Grid>
            </Grid>
            <BrowseMataKuliahDialog open={dialogOpen} onClose={() => setDialogOpen(false)} enrolledIds={enrolledIds} onEnrollSuccess={handleEnrollSuccess} />
            <ScrollTop><Fab size="small" color="secondary"><KeyboardArrowUp /></Fab></ScrollTop>
            
            {showGreeting && (
                <GreetingBubble 
                    user={user} 
                    onClose={() => setShowGreeting(false)} 
                    role="mahasiswa" 
                />
            )}
            <Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification({ ...notification, open: false })}><Alert severity="success" onClose={() => setNotification({ ...notification, open: false })}>{notification.message}</Alert></Snackbar>
        </Container>
    );
};

export default MahasiswaDashboard;