import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
    Container, Typography, Box, Paper, List, ListItemText, CircularProgress,
    Button, TextField, Dialog, DialogActions, DialogContent,
    DialogTitle, Chip, Divider, Link, Card, CardContent, Grid, Avatar, IconButton, Tooltip,
    Stack, ListItem, ListItemAvatar, Menu, MenuItem, Alert
} from '@mui/material';
import {
    RateReview as RateReviewIcon, Assignment as AssignmentIcon, Person as PersonIcon,
    Grade as GradeIcon, Visibility as VisibilityIcon,
    Pending as PendingIcon, CheckCircle as CheckCircleIcon, Group as GroupIcon,
    FactCheck as FactCheckIcon, Rule as RuleIcon, DonutLarge as DonutLargeIcon,
    Delete as DeleteIcon, EditCalendar as EditCalendarIcon,
    ArrowBack as ArrowBackIcon, Download as DownloadIcon, Edit as EditIcon,
    AttachFile as AttachFileIcon, Close as CloseIcon,
    CalendarToday as CalendarTodayIcon
} from '@mui/icons-material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';

const StatCard = ({ icon, value, label, color }) => (
    <Paper variant="outlined" sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ bgcolor: `${color}.lighter`, color: `${color}.main` }}>{icon}</Avatar>
        <Box><Typography variant="h5" fontWeight="bold">{value}</Typography><Typography variant="body2" color="text.secondary">{label}</Typography></Box>
    </Paper>
);

const PageHeader = ({ tugas, submissions, onEditTugasClick, onEditTenggatClick, onExportClick }) => {
    const gradedCount = submissions.filter(s => s.status === 'dinilai').length;
    const progress = submissions.length > 0 ? Math.round((gradedCount / submissions.length) * 100) : 0;
    return (
        <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between">
                <Box>
                    <Typography variant="h4" fontWeight="bold">{tugas?.judul}</Typography>
                    <Typography color="text.secondary" sx={{ mt: 1 }}>Kelola submission dan detail tugas.</Typography>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
                    <Button variant="outlined" startIcon={<EditIcon />} onClick={onEditTugasClick}>Edit Tugas</Button>
                    <Button variant="outlined" startIcon={<EditCalendarIcon />} onClick={onEditTenggatClick}>Edit Tenggat</Button>
                    <Button variant="contained" startIcon={<DownloadIcon />} onClick={onExportClick} disabled={submissions.length === 0}>Ekspor</Button>
                </Stack>
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
                <Grid item xs={6} sm={3}><StatCard icon={<GroupIcon />} value={submissions.length} label="Submission" color="primary" /></Grid>
                <Grid item xs={6} sm={3}><StatCard icon={<FactCheckIcon />} value={gradedCount} label="Dinilai" color="success" /></Grid>
                <Grid item xs={6} sm={3}><StatCard icon={<RuleIcon />} value={submissions.length - gradedCount} label="Belum Dinilai" color="warning" /></Grid>
                <Grid item xs={6} sm={3}><StatCard icon={<DonutLargeIcon />} value={`${progress}%`} label="Progress" color="info" /></Grid>
            </Grid>
        </Paper>
    );
};

// --- PERBAIKAN: Gunakan data denormalisasi dari `sub` ---
const SubmissionItem = ({ sub, tugas, onOpenDialog, onDeleteClick }) => {
    const formatDate = (dateString) => new Date(dateString).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const isDinilai = sub.status === 'dinilai';
    const isLate = new Date(sub.tanggalPengumpulan) > new Date(tugas.tenggat);

    return (
        <ListItem sx={{ py: 2 }}>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={5} md={4}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <ListItemAvatar>
                            <Avatar sx={{ bgcolor: isDinilai ? 'success.lighter' : 'warning.lighter', color: isDinilai ? 'success.darker' : 'warning.darker' }}>
                                <PersonIcon />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={<Typography variant="subtitle1" fontWeight="medium">{sub.namaMahasiswa}</Typography>}
                            secondary={
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                    <CalendarTodayIcon sx={{ fontSize: 14 }} color="action" />
                                    <Typography variant="caption" color="text.secondary">{formatDate(sub.tanggalPengumpulan)}</Typography>
                                </Stack>
                            }
                        />
                    </Stack>
                </Grid>
                <Grid item xs={12} sm={7} md={8}>
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end" useFlexGap flexWrap="wrap">
                        <Chip label={isLate ? "Terlambat" : "Tepat Waktu"} color={isLate ? "error" : "success"} size="small" variant="outlined" />
                        <Chip icon={isDinilai ? <CheckCircleIcon /> : <PendingIcon />} label={isDinilai ? `Nilai: ${sub.nilai}` : 'Belum Dinilai'} color={isDinilai ? 'success' : 'warning'} />
                        <Tooltip title="Lihat File"><IconButton component={Link} href={`http://localhost:5000${sub.fileUrl}`} target="_blank" color="primary"><VisibilityIcon /></IconButton></Tooltip>
                        <Tooltip title="Nilai & Feedback"><IconButton color="primary" onClick={() => onOpenDialog(sub)}><RateReviewIcon /></IconButton></Tooltip>
                        <Tooltip title="Hapus Submission"><IconButton color="error" onClick={() => onDeleteClick(sub)}><DeleteIcon /></IconButton></Tooltip>
                    </Stack>
                </Grid>
            </Grid>
        </ListItem>
    );
};

const EditTugasDialog = ({ open, onClose, tugas, onTugasUpdated }) => {
    const [judul, setJudul] = useState('');
    const [deskripsi, setDeskripsi] = useState('');
    const [lampiran, setLampiran] = useState(null);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (tugas) { setJudul(tugas.judul); setDeskripsi(tugas.deskripsi); }
    }, [tugas]);

    const handleFileChange = (e) => setLampiran(e.target.files[0]);

    const handleSubmit = async () => {
        setError(''); setSubmitting(true);
        const formData = new FormData();
        formData.append('judul', judul);
        formData.append('deskripsi', deskripsi);
        if (lampiran) formData.append('lampiranTugas', lampiran);
        try {
            const res = await api.put(`/tugas/${tugas._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            onTugasUpdated(res.data);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal memperbarui tugas.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle><Stack direction="row" alignItems="center" justifyContent="space-between">Edit Detail Tugas <IconButton onClick={onClose}><CloseIcon /></IconButton></Stack></DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ pt: 1 }}>
                    {error && <Alert severity="error">{error}</Alert>}
                    <TextField autoFocus label="Judul Tugas" fullWidth value={judul} onChange={e => setJudul(e.target.value)} />
                    <TextField label="Deskripsi" fullWidth multiline rows={4} value={deskripsi} onChange={e => setDeskripsi(e.target.value)} />
                    <Box>
                        <Button variant="outlined" component="label" startIcon={<AttachFileIcon />}>Ganti Lampiran (Opsional)<input type="file" hidden onChange={handleFileChange} /></Button>
                        <Typography variant="body2" sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}>
                            File saat ini: {lampiran ? lampiran.name : (tugas?.lampiranUrl?.split('/').pop() || 'Tidak ada')}
                        </Typography>
                    </Box>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose}>Batal</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
                    {submitting ? <CircularProgress size={24} /> : 'Simpan Perubahan'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};


const TugasDetailDosen = ({ socket }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tugas, setTugas] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogs, setDialogs] = useState({ grading: false, delete: false, tenggat: false, editTugas: false });
    const [currentSubmission, setCurrentSubmission] = useState(null);
    const [nilai, setNilai] = useState('');
    const [feedback, setFeedback] = useState('');
    const [newTenggat, setNewTenggat] = useState('');
    const [dialogError, setDialogError] = useState('');
    const [anchorElExport, setAnchorElExport] = useState(null);

    const fetchData = useCallback(() => {
        if (!id) return;
        setLoading(true);
        Promise.all([
            api.get(`/tugas/${id}`), 
            // --- PERBAIKAN: Tidak perlu populate lagi, controller sudah disederhanakan ---
            api.get(`/tugas/${id}/submissions`) 
        ])
            .then(([tugasRes, subRes]) => {
                setTugas(tugasRes.data);
                setSubmissions(subRes.data.sort((a, b) => new Date(b.tanggalPengumpulan) - new Date(a.tanggalPengumpulan)));
            }).catch(err => console.error(err)).finally(() => setLoading(false));
    }, [id]);

    useEffect(() => { fetchData(); }, [fetchData]);
    
    useEffect(() => {
        if (!socket) return;
        const handleTugasUpdate = (updatedTugas) => { if (updatedTugas._id === id) setTugas(updatedTugas); };
        const handleNewSubmission = (newSubmission) => {
            if (newSubmission.tugasId === id) {
                // Tambah atau perbarui submission secara real-time
                setSubmissions(prev => {
                    const existing = prev.find(s => s._id === newSubmission._id);
                    if (existing) {
                        return prev.map(s => s._id === newSubmission._id ? newSubmission : s);
                    }
                    return [newSubmission, ...prev];
                });
            }
        };

        socket.on('tenggatUpdated', (data) => handleTugasUpdate(data));
        socket.on('tugasUpdated', handleTugasUpdate);
        socket.on('submissionBaru', handleNewSubmission);

        return () => {
            socket.off('tenggatUpdated');
            socket.off('tugasUpdated');
            socket.off('submissionBaru');
        };
    }, [socket, id]);

    const openDialog = useCallback((name, data = null) => {
        if (name === 'grading' || name === 'delete') setCurrentSubmission(data);
        if (name === 'grading') { setNilai(data.nilai || ''); setFeedback(data.feedback || ''); }
        if (name === 'tenggat' && tugas?.tenggat) {
            const now = new Date(tugas.tenggat);
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            setNewTenggat(now.toISOString().slice(0, 16));
        }
        setDialogs(prev => ({ ...prev, [name]: true }));
    }, [tugas]);

    const closeDialogs = useCallback(() => {
        setDialogs({ grading: false, delete: false, tenggat: false, editTugas: false });
        setCurrentSubmission(null);
        setDialogError('');
    }, []);

    const handleNilaiSubmit = useCallback(async () => {
        const numNilai = parseInt(nilai, 10);
        if (isNaN(numNilai) || numNilai < 0 || numNilai > 100) { setDialogError('Nilai harus antara 0 dan 100'); return; }
        setDialogError('');
        try {
            const res = await api.put(`/tugas/submissions/${currentSubmission._id}/nilai`, { nilai: numNilai, feedback });
            setSubmissions(prev => prev.map(s => s._id === currentSubmission._id ? res.data : s));
            closeDialogs();
        } catch (err) { setDialogError('Gagal menyimpan nilai.'); }
    }, [nilai, feedback, currentSubmission, closeDialogs]);

    const handleDeleteConfirm = useCallback(async () => {
        if (!currentSubmission) return;
        try {
            await api.delete(`/tugas/submissions/${currentSubmission._id}`);
            setSubmissions(prev => prev.filter(s => s._id !== currentSubmission._id));
            closeDialogs();
        } catch (err) { console.error(err); }
    }, [currentSubmission, closeDialogs]);

    const handleTenggatSubmit = useCallback(async () => {
        try {
            const res = await api.put(`/tugas/${id}/tenggat`, { tenggat: newTenggat });
            setTugas(res.data);
            closeDialogs();
        } catch (err) { console.error(err); }
    }, [id, newTenggat, closeDialogs]);
    
    const handleTugasUpdated = (updatedTugas) => {
        setTugas(updatedTugas);
    };

    const handleExportMenuClick = (event) => setAnchorElExport(event.currentTarget);
    const handleExportMenuClose = () => setAnchorElExport(null);
    const handleExportExcel = () => {
        const dataToExport = submissions.map(sub => ({
            'Nama Mahasiswa': sub.namaMahasiswa, 'NIM': sub.nim || '-',
            'Waktu Mengumpulkan': new Date(sub.tanggalPengumpulan).toLocaleString('id-ID'),
            'Status Pengumpulan': new Date(sub.tanggalPengumpulan) > new Date(tugas.tenggat) ? 'Terlambat' : 'Tepat Waktu',
            'Nilai': sub.nilai ?? 'N/A', 'Feedback': sub.feedback || '-'
        }));
        const csv = Papa.unparse(dataToExport);
        const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Nilai_${tugas.judul.replace(/\s+/g, '_')}.csv`;
        link.click();
        handleExportMenuClose();
    };
    const handleExportPdf = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text(`Laporan Nilai - ${tugas.judul}`, 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Mata Kuliah: ${tugas.mataKuliahId.nama}`, 14, 30);
        const tableColumn = ["No", "Nama Mahasiswa", "NIM", "Waktu", "Status", "Nilai"];
        const tableRows = submissions.map((sub, index) => [
            index + 1, sub.namaMahasiswa, sub.nim || '-',
            new Date(sub.tanggalPengumpulan).toLocaleDateString('id-ID'),
            new Date(sub.tanggalPengumpulan) > new Date(tugas.tenggat) ? 'Terlambat' : 'Tepat Waktu',
            sub.nilai ?? 'N/A'
        ]);
        autoTable(doc, { head: [tableColumn], body: tableRows, startY: 35 });
        doc.save(`Nilai_${tugas.judul.replace(/\s+/g, '_')}.pdf`);
        handleExportMenuClose();
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;
    if (!tugas) return <Container sx={{py: 4}}><Alert severity="error">Tugas tidak ditemukan.</Alert></Container>

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>Kembali</Button>
            <PageHeader tugas={tugas} submissions={submissions} onEditTugasClick={() => openDialog('editTugas')} onEditTenggatClick={() => openDialog('tenggat')} onExportClick={handleExportMenuClick} />
            <Menu anchorEl={anchorElExport} open={Boolean(anchorElExport)} onClose={handleExportMenuClose}>
                <MenuItem onClick={handleExportExcel}>Ekspor ke Excel (CSV)</MenuItem>
                <MenuItem onClick={handleExportPdf}>Ekspor ke PDF</MenuItem>
            </Menu>
            <Paper>
                <List sx={{ p: 0 }}>
                    {submissions.length > 0 ? submissions.map((sub, index) => (
                        <React.Fragment key={sub._id}>
                            <SubmissionItem sub={sub} tugas={tugas} onOpenDialog={(s) => openDialog('grading', s)} onDeleteClick={(s) => openDialog('delete', s)} />
                            {index < submissions.length - 1 && <Divider />}
                        </React.Fragment>
                    )) : (
                        <Box sx={{ py: 8, textAlign: 'center', color: 'text.disabled' }}>
                            <AssignmentIcon sx={{ fontSize: 60, mb: 2 }} />
                            <Typography variant="h6">Belum Ada Submission</Typography>
                        </Box>
                    )}
                </List>
            </Paper>
            <EditTugasDialog open={dialogs.editTugas} onClose={closeDialogs} tugas={tugas} onTugasUpdated={handleTugasUpdated} />
            <Dialog open={dialogs.grading} onClose={closeDialogs} fullWidth maxWidth="sm"><DialogTitle>Penilaian untuk: <Typography component="span" fontWeight="bold">{currentSubmission?.namaMahasiswa}</Typography></DialogTitle><DialogContent><Stack spacing={2} sx={{ pt: 1 }}><Button component={Link} href={`http://localhost:5000${currentSubmission?.fileUrl}`} target="_blank" variant="outlined" startIcon={<VisibilityIcon />}>Lihat File Jawaban</Button><TextField autoFocus label="Nilai (0-100)" type="number" fullWidth value={nilai} onChange={(e) => setNilai(e.target.value)} error={!!dialogError} helperText={dialogError} /><TextField label="Feedback" fullWidth multiline rows={4} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Berikan komentar konstruktif..." /></Stack></DialogContent><DialogActions sx={{ p: '16px 24px' }}><Button onClick={closeDialogs}>Batal</Button><Button onClick={handleNilaiSubmit} variant="contained" startIcon={<GradeIcon />}>Simpan Nilai</Button></DialogActions></Dialog>
            <Dialog open={dialogs.delete} onClose={closeDialogs} fullWidth maxWidth="xs"><DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><DeleteIcon color="error" /> Konfirmasi Hapus</DialogTitle><DialogContent><Typography>Anda yakin ingin menghapus submission dari <Typography component="span" fontWeight="bold">{currentSubmission?.namaMahasiswa}</Typography>? File terkait akan dihapus permanen.</Typography></DialogContent><DialogActions sx={{ p: '16px 24px' }}><Button onClick={closeDialogs}>Batal</Button><Button onClick={handleDeleteConfirm} variant="contained" color="error" startIcon={<DeleteIcon />}>Ya, Hapus</Button></DialogActions></Dialog>
            <Dialog open={dialogs.tenggat} onClose={closeDialogs} fullWidth maxWidth="xs"><DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><EditCalendarIcon color="primary" /> Edit Tenggat Waktu</DialogTitle><DialogContent><Typography gutterBottom>Pilih tenggat waktu baru untuk tugas "{tugas?.judul}".</Typography><TextField autoFocus margin="normal" label="Tenggat Baru" type="datetime-local" fullWidth value={newTenggat} onChange={(e) => setNewTenggat(e.target.value)} InputLabelProps={{ shrink: true }} /></DialogContent><DialogActions sx={{ p: '16px 24px' }}><Button onClick={closeDialogs}>Batal</Button><Button onClick={handleTenggatSubmit} variant="contained">Simpan</Button></DialogActions></Dialog>
        </Container>
    );
};

export default TugasDetailDosen;