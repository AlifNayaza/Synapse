import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
    Container, Typography, Box, Paper, CircularProgress, Alert, Button,
    Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider,
    TextField, Grid, Card, CardContent, Stack, Avatar, Tooltip, Menu, MenuItem, ListItemText, IconButton
} from '@mui/material';
import {
    RateReview as RateReviewIcon, Quiz as QuizIcon, Person as PersonIcon,
    Grade as GradeIcon, Group as GroupIcon, Functions as FunctionsIcon,
    DoneAll as DoneAllIcon, Info as InfoIcon, ArrowBack as ArrowBackIcon,
    Warning as WarningIcon, Download as DownloadIcon,
    Event as EventIcon, Timer as TimerIcon, Close as CloseIcon
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

const PageHeader = ({ kuis, hasil, onExportClick }) => {
    const averageScore = hasil.length > 0 ? (hasil.reduce((sum, h) => sum + (h.skor ?? 0), 0) / hasil.length).toFixed(1) : 0;
    const lulusCount = hasil.filter(h => (h.skor ?? 0) >= 70).length;

    return (
        <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems="flex-start">
                <Box>
                    <Typography variant="h4" fontWeight="bold">{kuis?.judul}</Typography>
                    <Typography color="text.secondary" sx={{ mt: 1 }}>Hasil & Evaluasi Kuis</Typography>
                    <Stack direction="row" spacing={2} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
                        <Chip icon={<EventIcon />} label={`Dibuka: ${kuis ? new Date(kuis.tanggalBuka).toLocaleDateString('id-ID') : '...'}`} variant="outlined" />
                        <Chip icon={<EventIcon />} label={`Tenggat: ${kuis ? new Date(kuis.tenggat).toLocaleDateString('id-ID') : '...'}`} variant="outlined" />
                        <Chip icon={<TimerIcon />} label={`Durasi: ${kuis?.waktuPengerjaan} menit`} variant="outlined" />
                    </Stack>
                </Box>
                <Button variant="contained" startIcon={<DownloadIcon />} onClick={onExportClick} disabled={hasil.length === 0} sx={{ mt: { xs: 2, md: 0 } }}>
                    Ekspor Hasil
                </Button>
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
                <Grid item xs={6} sm={4}><StatCard icon={<GroupIcon />} value={hasil.length} label="Total Peserta" color="primary" /></Grid>
                <Grid item xs={6} sm={4}><StatCard icon={<FunctionsIcon />} value={averageScore} label="Rata-rata Skor" color="info" /></Grid>
                <Grid item xs={12} sm={4}><StatCard icon={<DoneAllIcon />} value={lulusCount} label="Peserta Lulus" color="success" /></Grid>
            </Grid>
        </Paper>
    );
};

// --- UPDATED: Use `namaMahasiswa` and `nim` directly ---
const ResultCard = ({ result, onOpenDialog }) => {
    const getScoreColor = (score) => {
        if (score >= 85) return 'success'; if (score >= 70) return 'info';
        if (score >= 60) return 'warning'; return 'error';
    };
    const hasCheatingLog = result.logKecurangan && result.logKecurangan.length > 0;

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.lighter', color: 'primary.darker' }}><PersonIcon /></Avatar>
                    <ListItemText primary={<Typography variant="subtitle1" fontWeight="medium" noWrap>{result.namaMahasiswa || 'N/A'}</Typography>} secondary={new Date(result.tanggalPengumpulan).toLocaleDateString('id-ID')} />
                    {hasCheatingLog && (<Tooltip title={`${result.logKecurangan.length}x pindah tab terdeteksi`}><WarningIcon color="warning" /></Tooltip>)}
                </Stack>
                <Chip label={`Skor: ${result.skor ?? 'N/A'}`} color={getScoreColor(result.skor)} sx={{ fontWeight: 'bold', width: '100%', fontSize: '1rem', py: 2.5 }} />
            </CardContent>
            <Box sx={{ p: 2, pt: 0 }}><Button fullWidth variant="contained" startIcon={<RateReviewIcon />} onClick={() => onOpenDialog(result)}>Review</Button></Box>
        </Card>
    );
};

const ReviewDialog = ({ open, onClose, kuis, submission, onSave }) => {
    const [skor, setSkor] = useState('');
    const [feedback, setFeedback] = useState('');
    useEffect(() => { if (submission) { setSkor(submission.skor); setFeedback(submission.feedback || ''); } }, [submission]);
    if (!submission) return null;
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle><Stack direction="row" justifyContent="space-between" alignItems="center">Review Jawaban: <Typography component="span" fontWeight="bold">{submission.namaMahasiswa}</Typography><IconButton onClick={onClose}><CloseIcon/></IconButton></Stack></DialogTitle>
            <DialogContent dividers>
                {submission.logKecurangan?.length > 0 && (<Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2 }}>Terdeteksi {submission.logKecurangan.length} kali aktivitas pindah tab/window.</Alert>)}
                <Stack spacing={2} sx={{ my: 2 }}>
                    {kuis?.pertanyaan.map((p, index) => {
                        const jawabanMahasiswa = (submission.jawaban ?? []).find(j => j.pertanyaanId.toString() === p._id.toString());
                        return (
                            <Paper key={p._id} variant="outlined">
                                <Box sx={{ p: 2, bgcolor: 'background.default', borderBottom: '1px solid', borderColor: 'divider' }}><Typography variant="subtitle1" fontWeight="bold">{`Pertanyaan ${index + 1}: ${p.soal}`}</Typography></Box>
                                <Box sx={{ p: 2 }}>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>Jawaban Mahasiswa:</Typography>
                                    <Paper variant="outlined" sx={{ p: 2, mb: 2, borderColor: 'divider' }}><Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{jawabanMahasiswa?.jawabanTeks || <em>(Tidak Dijawab)</em>}</Typography></Paper>
                                    {jawabanMahasiswa?.aiFeedback && (<Alert icon={<InfoIcon fontSize="inherit" />} severity="info"><strong>Feedback AI:</strong> {jawabanMahasiswa.aiFeedback}</Alert>)}
                                </Box>
                            </Paper>
                        );
                    })}
                    <Divider sx={{ pt: 1 }} />
                    <Paper sx={{ p: 2 }}><Typography variant="h6" gutterBottom>Override Penilaian</Typography><Grid container spacing={2} alignItems="center"><Grid item xs={12} sm={8}><TextField label="Skor Baru (0-100)" type="number" fullWidth value={skor} onChange={(e) => setSkor(e.target.value)} /></Grid><Grid item xs={12} sm={4}><Chip label={`Preview: ${skor || 0}`} sx={{ width: '100%' }} /></Grid><Grid item xs={12}><TextField label="Feedback Tambahan (Opsional)" fullWidth multiline rows={3} value={feedback} onChange={(e) => setFeedback(e.target.value)} /></Grid></Grid></Paper>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: '16px 24px' }}><Button onClick={onClose}>Batal</Button><Button onClick={() => onSave(submission._id, skor, feedback)} variant="contained" startIcon={<GradeIcon />}>Simpan Perubahan</Button></DialogActions>
        </Dialog>
    );
};

const KuisDetailDosen = ({ socket }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [kuis, setKuis] = useState(null);
    const [hasil, setHasil] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedHasil, setSelectedHasil] = useState(null);
    const [anchorElExport, setAnchorElExport] = useState(null);

    const fetchData = useCallback(() => {
        if (!id) return;
        setLoading(true);
        // --- UPDATED: No more populate needed for hasil/submissions ---
        Promise.all([api.get(`/kuis/${id}`), api.get(`/kuis/${id}/hasil`)])
            .then(([kuisRes, hasilRes]) => {
                setKuis(kuisRes.data);
                setHasil(hasilRes.data.sort((a, b) => (b.skor ?? 0) - (a.skor ?? 0)));
            })
            .catch(err => console.error("Gagal memuat data:", err))
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => { fetchData(); }, [fetchData]);
    useEffect(() => {
        if (!socket) return;
        const handleNewSubmission = (newSubmission) => {
            if (newSubmission.kuisId === id) {
                 setHasil(prev => [newSubmission, ...prev].sort((a,b) => (b.skor ?? 0) - (a.skor ?? 0)));
            }
        };
        socket.on('kuisDinilai', handleNewSubmission);
        return () => { socket.off('kuisDinilai', handleNewSubmission); };
    }, [socket, id]);

    const handleOpenDialog = useCallback((submission) => { setSelectedHasil(submission); setDialogOpen(true); }, []);
    const handleCloseDialog = useCallback(() => setDialogOpen(false), []);
    const handleNilaiUlang = useCallback(async (submissionId, skor, feedback) => {
        try {
            const res = await api.put(`/kuis/submissions/${submissionId}/override`, { skor: parseInt(skor, 10), feedback });
            setHasil(prev => prev.map(h => (h._id === submissionId ? res.data : h)).sort((a, b) => (b.skor ?? 0) - (a.skor ?? 0)));
            handleCloseDialog();
        } catch (err) { alert("Gagal menyimpan perubahan."); }
    }, [handleCloseDialog]);
    
    const handleExportMenuClick = (event) => setAnchorElExport(event.currentTarget);
    const handleExportMenuClose = () => setAnchorElExport(null);

    const handleExportExcel = () => {
        const dataToExport = hasil.map(h => ({
            'Nama Mahasiswa': h.namaMahasiswa || 'N/A',
            'NIM': h.nim || '-',
            'Waktu Mengerjakan': new Date(h.tanggalPengumpulan).toLocaleString('id-ID'),
            'Skor': h.skor ?? 'N/A',
            'Pindah Tab': h.logKecurangan?.length || 0,
        }));

        const headerInfo = [
            `Judul Kuis:,${kuis.judul}`,
            `Mata Kuliah:,${kuis.mataKuliahId.nama}`,
            `Durasi:,${kuis.waktuPengerjaan} menit`,
            `Tenggat:,${new Date(kuis.tenggat).toLocaleString('id-ID')}`
        ].join('\n');
        
        const csvDataTable = Papa.unparse(dataToExport);
        const finalCsvString = `${headerInfo}\n\n${csvDataTable}`;

        const blob = new Blob(["\uFEFF" + finalCsvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Hasil_Kuis_${kuis.judul.replace(/\s+/g, '_')}.csv`;
        link.click();
        handleExportMenuClose();
    };

    const handleExportPdf = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text(`Laporan Hasil Kuis - ${kuis.judul}`, 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Mata Kuliah: ${kuis.mataKuliahId.nama}`, 14, 30);
        doc.text(`Durasi: ${kuis.waktuPengerjaan} menit`, 14, 36);
        doc.text(`Tenggat: ${new Date(kuis.tenggat).toLocaleString('id-ID')}`, 14, 42);

        const tableColumn = ["No", "Nama Mahasiswa", "NIM", "Skor", "Pindah Tab"];
        const tableRows = hasil.map((h, index) => [
            index + 1,
            h.namaMahasiswa || 'N/A',
            h.nim || '-',
            h.skor ?? 'N/A',
            h.logKecurangan?.length || 0,
        ]);
        autoTable(doc, { head: [tableColumn], body: tableRows, startY: 50 });
        doc.save(`Hasil_Kuis_${kuis.judul.replace(/\s+/g, '_')}.pdf`);
        handleExportMenuClose();
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;
    if (!kuis) return <Container sx={{py:4}}><Alert severity="error">Kuis tidak ditemukan.</Alert></Container>

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>Kembali</Button>
            
            <PageHeader kuis={kuis} hasil={hasil} onExportClick={handleExportMenuClick} />

            <Menu anchorEl={anchorElExport} open={Boolean(anchorElExport)} onClose={handleExportMenuClose}>
                <MenuItem onClick={handleExportExcel}>Ekspor ke Excel (CSV)</MenuItem>
                <MenuItem onClick={handleExportPdf}>Ekspor ke PDF</MenuItem>
            </Menu>

            {hasil.length > 0 ? (
                <Grid container spacing={3}>
                    {hasil.map((h) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={h._id}>
                            <ResultCard result={h} onOpenDialog={handleOpenDialog} />
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Paper sx={{ p: 6, textAlign: 'center', color: 'text.disabled', mt: 3 }}>
                    <QuizIcon sx={{ fontSize: 60, mb: 2 }} />
                    <Typography variant="h6">Belum Ada Pengerjaan</Typography>
                </Paper>
            )}

            <ReviewDialog open={dialogOpen} onClose={handleCloseDialog} kuis={kuis} submission={selectedHasil} onSave={handleNilaiUlang} />
        </Container>
    );
};

export default KuisDetailDosen;