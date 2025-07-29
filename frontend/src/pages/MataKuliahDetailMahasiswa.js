import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import {
    Container, Typography, Box, Paper, CircularProgress, Tabs, Tab,
    List, ListItem, ListItemText, Avatar, Chip, Button,
    Card, CardContent, Divider, Stack, Grid, Snackbar, Alert,
    ListItemAvatar, InputAdornment, TextField
} from '@mui/material';
import { 
    Assignment as AssignmentIcon, Quiz as QuizIcon, ArrowBack as ArrowBackIcon,
    School as SchoolIcon, Person as PersonIcon, ChevronRight as ChevronRightIcon,
    CheckCircle as CheckCircleIcon, Schedule as ScheduleIcon, PlayArrow as PlayArrowIcon,
    Star as StarIcon, EventBusy as EventBusyIcon, Group as GroupIcon, // <-- Impor Ikon Group
    Search as SearchIcon // <-- Impor Ikon Search
} from '@mui/icons-material';

const PageHeader = ({ mataKuliah, averageTugas, averageKuis }) => {
    return (
        <Card sx={{ mb: 3, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'background.paper', color: 'primary.main', width: 56, height: 56 }}><SchoolIcon /></Avatar>
                    <Box>
                        <Typography variant="h4" fontWeight="bold">{mataKuliah.nama}</Typography>
                        <Typography variant="h6" sx={{ opacity: 0.9 }}>{mataKuliah.kode}</Typography>
                    </Box>
                </Stack>
                <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.2)' }} />
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PersonIcon fontSize="small" />
                            <Typography>Dosen: {mataKuliah.dosenId.nama}</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm="auto">
                         <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            <Chip icon={<AssignmentIcon />} label={`Avg. Tugas: ${averageTugas}`} sx={{ bgcolor: 'background.paper' }} />
                            <Chip icon={<QuizIcon />} label={`Avg. Kuis: ${averageKuis}`} sx={{ bgcolor: 'background.paper' }} />
                        </Stack>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

const ActivityList = ({ items, submissions, type, navigate }) => {
    const formatDateTime = (dateString) => new Date(dateString).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    if (items.length === 0) {
        return (
            <Box sx={{ p: 4, textAlign: 'center', color: 'text.disabled' }}>
                {type === 'tugas' ? <AssignmentIcon sx={{ fontSize: 48, mb: 2 }} /> : <QuizIcon sx={{ fontSize: 48, mb: 2 }} />}
                <Typography variant="h6">Belum ada {type}</Typography>
            </Box>
        );
    }
    return (
        <List sx={{ p: 0 }}>
            {items.map((item, index) => {
                const sub = submissions.find(s => (type === 'tugas' && s.tugasId === item._id) || (type === 'kuis' && s.kuisId === item._id));
                const isCompleted = !!sub;
                const isOverdue = new Date(item.tenggat) < new Date();
                let statusChip;
                if (isCompleted) {
                    if (sub.status === 'dinilai') statusChip = <Chip label={type === 'tugas' ? `Nilai: ${sub.nilai}` : `Skor: ${sub.skor}`} color="success" size="small" icon={<StarIcon />} />;
                    else statusChip = <Chip label="Terkumpul" color="info" size="small" icon={<CheckCircleIcon />} />;
                } else {
                    if (isOverdue) statusChip = <Chip label="Terlewat" color="error" size="small" icon={<EventBusyIcon />} variant="outlined" />;
                    else statusChip = <Chip label="Belum Dikerjakan" color="warning" size="small" icon={<ScheduleIcon />} variant="outlined" />;
                }
                let actionButton;
                if (type === 'tugas') actionButton = <Button size="small" endIcon={<ChevronRightIcon />} onClick={() => navigate(`/tugas/${item._id}`)}>Lihat</Button>;
                else {
                    if (isCompleted) actionButton = <Button variant="outlined" size="small" onClick={() => navigate(`/kuis/${item._id}/hasil`)}>Lihat Hasil</Button>;
                    else actionButton = <Button variant="contained" size="small" startIcon={<PlayArrowIcon />} onClick={() => navigate(`/kuis/${item._id}`)} disabled={isOverdue}>Kerjakan</Button>;
                }
                return (
                    <React.Fragment key={item._id}>
                        <ListItem sx={{ py: 2, flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'stretch' }}>
                            <ListItemText primary={<Typography variant="h6" fontWeight="medium">{item.judul}</Typography>} secondary={`Tenggat: ${formatDateTime(item.tenggat)}`} sx={{ mb: { xs: 2, sm: 0 } }} />
                            <Stack direction="row" spacing={2} alignItems="center" justifyContent="flex-end" minWidth={{ sm: 240 }}>{statusChip}{actionButton}</Stack>
                        </ListItem>
                        {index < items.length - 1 && <Divider />}
                    </React.Fragment>
                );
            })}
        </List>
    );
};

// --- KOMPONEN BARU UNTUK MENAMPILKAN DAFTAR MAHASISWA ---
const MahasiswaList = ({ mahasiswa, searchTerm, onSearchChange }) => {
    const filteredMahasiswa = useMemo(() => {
        if (!searchTerm) return mahasiswa;
        return mahasiswa.filter(m =>
            m.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (m.nim && m.nim.includes(searchTerm))
        );
    }, [mahasiswa, searchTerm]);

    return (
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <TextField
                fullWidth
                variant="outlined"
                placeholder="Cari teman sekelas..."
                value={searchTerm}
                onChange={onSearchChange}
                InputProps={{
                    startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>)
                }}
                sx={{ mb: 2 }}
            />
            {filteredMahasiswa.length > 0 ? (
                <List>
                    {filteredMahasiswa.map(m => (
                        <ListItem key={m._id} divider>
                            <ListItemAvatar>
                                <Avatar><PersonIcon /></Avatar>
                            </ListItemAvatar>
                            <ListItemText primary={m.nama} secondary={`NIM: ${m.nim || 'N/A'}`} />
                        </ListItem>
                    ))}
                </List>
            ) : (
                <Typography sx={{ textAlign: 'center', p: 3, color: 'text.secondary' }}>
                    Mahasiswa tidak ditemukan.
                </Typography>
            )}
        </Box>
    );
};

const MataKuliahDetailMahasiswa = ({ socket }) => {
    const { id: mataKuliahId } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [data, setData] = useState({ mataKuliah: null, tugasList: [], kuisList: [], submissions: [] });
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
    const [searchTerm, setSearchTerm] = useState(''); // State untuk pencarian mahasiswa

    const showNotification = (message, severity = 'info') => {
        setNotification({ open: true, message, severity });
    };

    const fetchData = useCallback(async () => {
        if (!user || !mataKuliahId) return;
        setLoading(true);
        try {
            const [mkRes, tugasRes, kuisRes, subRes] = await Promise.all([
                api.get(`/matakuliah/${mataKuliahId}`),
                api.get(`/tugas/matakuliah/${mataKuliahId}`),
                api.get(`/kuis/matakuliah/${mataKuliahId}`),
                api.get(`/mahasiswa/submissions/${user.id}`)
            ]);
            setData({ mataKuliah: mkRes.data, tugasList: tugasRes.data, kuisList: kuisRes.data, submissions: subRes.data });
        } catch (error) {
            console.error("Gagal memuat data:", error);
            showNotification('Gagal memuat data mata kuliah', 'error');
        } finally {
            setLoading(false);
        }
    }, [mataKuliahId, user]);

    useEffect(() => { fetchData(); }, [fetchData]);
    
    useEffect(() => {
        if (!socket || !user || !mataKuliahId) return;

        socket.emit('joinCourseRoom', mataKuliahId);
        // User room untuk notifikasi personal sudah di-handle di App.js, jadi tidak perlu di sini
        
        const updateSubmissionState = (updatedSubmission) => {
            setData(prev => {
                const newSubmissions = [...prev.submissions];
                const index = newSubmissions.findIndex(s => s._id === updatedSubmission._id);
                if (index > -1) {
                    newSubmissions[index] = updatedSubmission;
                } else {
                    newSubmissions.push(updatedSubmission);
                }
                return { ...prev, submissions: newSubmissions };
            });
        };
        
        const handleTugasDinilai = (updatedSubmission) => { 
            if(updatedSubmission.mataKuliahId === mataKuliahId) {
                updateSubmissionState(updatedSubmission); 
                showNotification('Tugas Anda telah dinilai!', 'success');
            }
        };
        
        const handleKuisDinilai = (updatedSubmission) => {
            if(updatedSubmission.mataKuliahId === mataKuliahId) {
                updateSubmissionState(updatedSubmission); 
                showNotification('Kuis Anda telah dinilai!', 'success');
            }
        };

        const handleNewActivity = (newActivity, type) => {
            if (newActivity.mataKuliahId && newActivity.mataKuliahId.toString() === mataKuliahId.toString()) {
                setData(prev => {
                    const listKey = type === 'tugas' ? 'tugasList' : 'kuisList';
                    const exists = prev[listKey].some(item => item._id === newActivity._id);
                    if (!exists) {
                        showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} baru: ${newActivity.judul}`, 'info');
                        const updatedList = [...prev[listKey], newActivity].sort((a, b) => 
                            new Date(a.tanggalBuka) - new Date(b.tanggalBuka)
                        );
                        return { ...prev, [listKey]: updatedList };
                    }
                    return prev;
                });
            }
        };

        const handleActivityDeleted = (payload, type) => {
            setData(prev => {
                const listKey = type === 'tugas' ? 'tugasList' : 'kuisList';
                const idKey = type === 'tugas' ? 'tugasId' : 'kuisId';
                const filteredList = prev[listKey].filter(item => item._id !== payload[idKey]);
                if (filteredList.length !== prev[listKey].length) {
                    showNotification(`Sebuah ${type} telah dihapus`, 'warning');
                }
                return { ...prev, [listKey]: filteredList };
            });
        };

        socket.on('tugasDinilai', handleTugasDinilai);
        socket.on('kuisDinilai', handleKuisDinilai);
        socket.on('tugasBaru', (newTugas) => handleNewActivity(newTugas, 'tugas'));
        socket.on('kuisBaru', (newKuis) => handleNewActivity(newKuis, 'kuis'));
        socket.on('tugasDihapus', (payload) => handleActivityDeleted(payload, 'tugas'));
        socket.on('kuisDihapus', (payload) => handleActivityDeleted(payload, 'kuis'));
        socket.on('tugasUpdated', fetchData);

        return () => {
            socket.emit('leaveCourseRoom', mataKuliahId);
            socket.off('tugasDinilai', handleTugasDinilai);
            socket.off('kuisDinilai', handleKuisDinilai);
            socket.off('tugasBaru');
            socket.off('kuisBaru');
            socket.off('tugasDihapus');
            socket.off('kuisDihapus');
            socket.off('tugasUpdated');
        };
    }, [socket, mataKuliahId, user, fetchData]);

    const averageTugas = useMemo(() => {
        const { tugasList, submissions } = data;
        if (tugasList.length === 0) return 'N/A';
        let totalNilai = 0;
        tugasList.forEach(tugas => {
            const sub = submissions.find(s => s.tugasId === tugas._id && s.status === 'dinilai' && s.nilai != null);
            if (sub) { totalNilai += sub.nilai; }
        });
        return Math.round(totalNilai / tugasList.length);
    }, [data.tugasList, data.submissions]);

    const averageKuis = useMemo(() => {
        const { kuisList, submissions } = data;
        if (kuisList.length === 0) return 'N/A';
        let totalSkor = 0;
        kuisList.forEach(kuis => {
            const sub = submissions.find(s => s.kuisId === kuis._id && s.status === 'dinilai' && s.skor != null);
            if (sub) { totalSkor += sub.skor; }
        });
        return Math.round(totalSkor / kuisList.length);
    }, [data.kuisList, data.submissions]);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;
    if (!data.mataKuliah) return <Typography sx={{ textAlign: 'center', mt: 4 }}>Mata Kuliah tidak ditemukan.</Typography>;

    return (
        <Container maxWidth="lg" sx={{ py: 3 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/mahasiswa/dashboard')} sx={{ mb: 3 }} variant="outlined">
                Kembali ke Dashboard
            </Button>
            
            <PageHeader mataKuliah={data.mataKuliah} averageTugas={averageTugas} averageKuis={averageKuis} />

            <Paper>
                {/* --- TAMBAHKAN TAB BARU DI SINI --- */}
                <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)} variant="fullWidth">
                    <Tab icon={<AssignmentIcon />} iconPosition="start" label={`Tugas (${data.tugasList.length})`} />
                    <Tab icon={<QuizIcon />} iconPosition="start" label={`Kuis (${data.kuisList.length})`} />
                    <Tab icon={<GroupIcon />} iconPosition="start" label={`Mahasiswa (${data.mataKuliah.mahasiswaIds.length})`} />
                </Tabs>
                <Box sx={{ minHeight: '40vh' }}>
                    {tabValue === 0 && <ActivityList items={data.tugasList} submissions={data.submissions} type="tugas" navigate={navigate} />}
                    {tabValue === 1 && <ActivityList items={data.kuisList} submissions={data.submissions} type="kuis" navigate={navigate} />}
                    {/* --- TAMBAHKAN KONTEN UNTUK TAB PESERTA --- */}
                    {tabValue === 2 && (
                        <MahasiswaList
                            mahasiswa={data.mataKuliah.mahasiswaIds}
                            searchTerm={searchTerm}
                            onSearchChange={(e) => setSearchTerm(e.target.value)}
                        />
                    )}
                </Box>
            </Paper>

            <Snackbar 
                open={notification.open} 
                autoHideDuration={4000} 
                onClose={() => setNotification({ ...notification, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert 
                    onClose={() => setNotification({ ...notification, open: false })} 
                    severity={notification.severity}
                    variant="filled"
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default MataKuliahDetailMahasiswa;