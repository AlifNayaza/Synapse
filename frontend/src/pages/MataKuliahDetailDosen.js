import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    Container, Typography, Box, CircularProgress, Tabs, Tab, Paper, Button,
    List, ListItemButton, ListItemText, ListItemAvatar, Avatar, Menu, MenuItem, Dialog,
    DialogTitle, DialogContent, TextField, DialogActions, Grid, IconButton, Alert,
    FormControl, InputLabel, Select, Divider, Tooltip, ListItem, Chip, Stack, InputAdornment,
    Card, CardContent, CardActions
} from '@mui/material';
import { 
    Assignment as AssignmentIcon, Quiz as QuizIcon, Group as GroupIcon,
    Add as AddIcon, Person as PersonIcon, AddCircleOutline as AddCircleOutlineIcon, 
    Delete as DeleteIcon, PersonRemove as PersonRemoveIcon,
    Event as EventIcon, Update as UpdateIcon, Done as DoneIcon,
    AttachFile as AttachFileIcon, TrendingUp as TrendingUpIcon, Close as CloseIcon,
    Search as SearchIcon, ChevronRight as ChevronRightIcon, School as SchoolIcon,
    Download as DownloadIcon
} from '@mui/icons-material';

// --- Komponen-komponen Dialog (CreateTugas, CreateKuis) TIDAK BERUBAH ---
const CreateTugasDialog = ({ open, onClose, mataKuliahId, onTugasCreated }) => {
    const [judul, setJudul] = useState('');
    const [deskripsi, setDeskripsi] = useState('');
    const [tenggat, setTenggat] = useState('');
    const [tanggalBuka, setTanggalBuka] = useState('');
    const [lampiran, setLampiran] = useState(null);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const handleFileChange = (e) => setLampiran(e.target.files[0]);
    const handleSubmit = async () => {
        setError(''); setSubmitting(true);
        const formData = new FormData();
        formData.append('judul', judul); formData.append('deskripsi', deskripsi);
        formData.append('tenggat', tenggat); formData.append('mataKuliahId', mataKuliahId);
        formData.append('tanggalBuka', tanggalBuka);
        if (lampiran) formData.append('lampiranTugas', lampiran);
        try {
            const res = await api.post('/tugas', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            onTugasCreated(res.data);
            handleClose();
        } catch (err) { setError(err.response?.data?.message || 'Gagal membuat tugas.'); } finally { setSubmitting(false); }
    };
    const handleClose = () => { setJudul(''); setDeskripsi(''); setTenggat(''); setTanggalBuka(''); setLampiran(null); setError(''); onClose(); };
    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle>Buat Tugas Baru</DialogTitle>
            <DialogContent><Stack spacing={2} sx={{ pt: 1 }}><TextField autoFocus label="Judul Tugas" fullWidth value={judul} onChange={e => setJudul(e.target.value)} /><TextField label="Deskripsi" fullWidth multiline rows={4} value={deskripsi} onChange={e => setDeskripsi(e.target.value)} /><Grid container spacing={2}><Grid item xs={12} sm={6}><TextField label="Dibuka Pada" type="datetime-local" fullWidth InputLabelProps={{ shrink: true }} value={tanggalBuka} onChange={e => setTanggalBuka(e.target.value)} /></Grid><Grid item xs={12} sm={6}><TextField label="Tenggat Waktu" type="datetime-local" fullWidth InputLabelProps={{ shrink: true }} value={tenggat} onChange={e => setTenggat(e.target.value)} /></Grid></Grid><Box><Button variant="outlined" component="label" startIcon={<AttachFileIcon />}>Lampirkan File<input type="file" hidden onChange={handleFileChange} /></Button>{lampiran && <Typography sx={{ display: 'inline', ml: 2 }} variant="body2">{lampiran.name}</Typography>}</Box>{error && <Alert severity="error">{error}</Alert>}</Stack></DialogContent>
            <DialogActions><Button onClick={handleClose}>Batal</Button><Button onClick={handleSubmit} variant="contained" disabled={submitting}>{submitting ? <CircularProgress size={24} /> : 'Buat'}</Button></DialogActions>
        </Dialog>
    );
};

const CreateKuisDialog = ({ open, onClose, mataKuliahId, onKuisCreated }) => {
    const [judul, setJudul] = useState('');
    const [waktuPengerjaan, setWaktuPengerjaan] = useState(60);
    const [tanggalBuka, setTanggalBuka] = useState('');
    const [tenggat, setTenggat] = useState('');
    const [pertanyaan, setPertanyaan] = useState([]);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const addPertanyaan = () => setPertanyaan([...pertanyaan, { soal: '', tipe: 'pilihanGanda', pilihan: ['', '', '', ''], kunciJawaban: '' }]);
    const removePertanyaan = (index) => setPertanyaan(pertanyaan.filter((_, i) => i !== index));
    const handlePertanyaanChange = (index, field, value) => {
        const newPertanyaan = [...pertanyaan]; newPertanyaan[index][field] = value;
        if (field === 'tipe') newPertanyaan[index].pilihan = value === 'pilihanGanda' ? ['', '', '', ''] : [];
        setPertanyaan(newPertanyaan);
    };
    const handlePilihanChange = (qIndex, pIndex, value) => {
        const newPertanyaan = [...pertanyaan]; newPertanyaan[qIndex].pilihan[pIndex] = value;
        setPertanyaan(newPertanyaan);
    };
    const handleSubmit = async () => {
        setError(''); setSubmitting(true);
        try {
            const res = await api.post('/kuis', { judul, waktuPengerjaan, pertanyaan, mataKuliahId, tanggalBuka, tenggat });
            onKuisCreated(res.data);
            handleClose();
        } catch (err) { setError(err.response?.data?.message || 'Gagal membuat kuis.'); } finally { setSubmitting(false); }
    };
    const handleClose = () => {
        setJudul(''); setWaktuPengerjaan(60); setPertanyaan([]); setTanggalBuka(''); setTenggat(''); setError('');
        onClose();
    };
    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>Buat Kuis Baru<IconButton onClick={handleClose}><CloseIcon /></IconButton></DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2}>{error && <Alert severity="error">{error}</Alert>}<Paper variant="outlined" sx={{ p: 2 }}><Typography variant="h6" gutterBottom>Informasi Umum</Typography><Grid container spacing={2}><Grid item xs={12}><TextField label="Judul Kuis" fullWidth required value={judul} onChange={(e) => setJudul(e.target.value)} /></Grid><Grid item xs={12} sm={4}><TextField label="Waktu (menit)" type="number" fullWidth required value={waktuPengerjaan} onChange={(e) => setWaktuPengerjaan(e.target.value)} /></Grid><Grid item xs={12} sm={4}><TextField label="Dibuka Pada" type="datetime-local" fullWidth InputLabelProps={{ shrink: true }} value={tanggalBuka} onChange={e => setTanggalBuka(e.target.value)} /></Grid><Grid item xs={12} sm={4}><TextField label="Tenggat" type="datetime-local" fullWidth InputLabelProps={{ shrink: true }} value={tenggat} onChange={e => setTenggat(e.target.value)} /></Grid></Grid></Paper>{pertanyaan.map((p, qIndex) => (<Paper key={qIndex} variant="outlined" sx={{ p: 2, position: 'relative' }}><Stack direction="row" justifyContent="space-between" alignItems="center"><Typography variant="h6">Pertanyaan {qIndex + 1}</Typography><Tooltip title="Hapus Pertanyaan"><IconButton onClick={() => removePertanyaan(qIndex)} size="small"><DeleteIcon color="error" /></IconButton></Tooltip></Stack><Divider sx={{ my: 1 }} /><Grid container spacing={2}><Grid item xs={12}><TextField label="Teks Pertanyaan" fullWidth required multiline rows={2} value={p.soal} onChange={(e) => handlePertanyaanChange(qIndex, 'soal', e.target.value)} /></Grid><Grid item xs={12} md={5}><FormControl fullWidth><InputLabel>Tipe</InputLabel><Select value={p.tipe} label="Tipe" onChange={(e) => handlePertanyaanChange(qIndex, 'tipe', e.target.value)}><MenuItem value="pilihanGanda">Pilihan Ganda</MenuItem><MenuItem value="essay">Essay</MenuItem></Select></FormControl></Grid><Grid item xs={12} md={7}><TextField label={p.tipe === 'essay' ? 'Kriteria Jawaban (untuk AI)' : 'Kunci Jawaban'} fullWidth required value={p.kunciJawaban} onChange={(e) => handlePertanyaanChange(qIndex, 'kunciJawaban', e.target.value)} /></Grid>{p.tipe === 'pilihanGanda' && p.pilihan.map((pil, pIndex) => (<Grid item xs={12} sm={6} key={pIndex}><TextField label={`Pilihan ${String.fromCharCode(65 + pIndex)}`} fullWidth required value={pil} onChange={(e) => handlePilihanChange(qIndex, pIndex, e.target.value)} /></Grid>))}</Grid></Paper>))}</Stack>
            </DialogContent>
            <DialogActions sx={{ p: '16px 24px', justifyContent: 'space-between' }}><Button variant="outlined" startIcon={<AddCircleOutlineIcon />} onClick={addPertanyaan}>Tambah Pertanyaan</Button><Box><Button onClick={handleClose} sx={{ mr: 1 }}>Batal</Button><Button onClick={handleSubmit} variant="contained" disabled={submitting}>{submitting ? <CircularProgress size={24} /> : 'Simpan Kuis'}</Button></Box></DialogActions>
        </Dialog>
    );
};

// --- PERUBAHAN DI SINI: Komponen Header menerima prop untuk ekspor ---
const PageHeader = ({ mataKuliah, onBuatAktivitasClick, onExportExcel, onExportPdf, isExporting }) => (
    <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} lg>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: 'primary.main', color: 'white', width: 56, height: 56 }}><SchoolIcon /></Avatar>
                        <Box>
                            <Typography variant="h4" fontWeight="bold">{mataKuliah.nama}</Typography>
                            <Typography variant="h6" color="text.secondary">{mataKuliah.kode}</Typography>
                        </Box>
                    </Stack>
                </Grid>
                <Grid item xs={12} lg="auto">
                    <Stack direction={{xs: 'column', sm: 'row'}} spacing={1} alignItems="stretch">
                         <Button variant="outlined" startIcon={<DownloadIcon />} onClick={onExportExcel} disabled={isExporting}>
                            Excel
                        </Button>
                        <Button variant="outlined" startIcon={<DownloadIcon />} onClick={onExportPdf} disabled={isExporting}>
                            PDF
                        </Button>
                        <Button variant="contained" size="large" startIcon={<AddIcon />} onClick={onBuatAktivitasClick}>
                            Buat Aktivitas
                        </Button>
                    </Stack>
                </Grid>
            </Grid>
            <Divider sx={{ my: 2 }} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2 }} alignItems="flex-start">
                <Chip icon={<PersonIcon />} label={`Dosen: ${mataKuliah.dosenId.nama}`} variant="outlined" />
                {/* --- PERBAIKAN: Ambil data rata-rata langsung dari prop --- */}
                <Chip icon={<AssignmentIcon />} label={`Rata-rata Tugas: ${mataKuliah.rataRataTugas?.toFixed(1) || 'N/A'}`} variant="outlined" color="primary" />
                <Chip icon={<QuizIcon />} label={`Rata-rata Kuis: ${mataKuliah.rataRataKuis?.toFixed(1) || 'N/A'}`} variant="outlined" color="secondary" />
            </Stack>
        </CardContent>
    </Card>
);

const ActivityCard = ({ item, type, navigate, onDelete }) => {
    const isTugas = type === 'tugas';
    const icon = isTugas ? <AssignmentIcon /> : <QuizIcon />;
    const link = `/dosen/${type}/${item._id}`;
    const now = new Date();
    const tglBuka = new Date(item.tanggalBuka);
    const tglTenggat = new Date(item.tenggat || Infinity);
    let status;
    if (now < tglBuka) status = { label: 'Dijadwalkan', color: 'info', icon: <EventIcon /> };
    else if (now > tglTenggat) status = { label: 'Selesai', color: 'default', icon: <DoneIcon /> };
    else status = { label: 'Aktif', color: 'success', icon: <UpdateIcon /> };

    return (
        <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.3s', '&:hover': { boxShadow: 6 } }}>
                <CardContent sx={{ flexGrow: 1 }}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                        <Avatar sx={{ bgcolor: isTugas ? 'primary.lighter' : 'secondary.lighter', color: isTugas ? 'primary.main' : 'secondary.main' }}>{icon}</Avatar>
                        <Typography variant="h6" fontWeight="bold" noWrap>{item.judul}</Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">Tenggat: {new Date(item.tenggat).toLocaleString('id-ID')}</Typography>
                    <Chip label={status.label} color={status.color} icon={status.icon} size="small" sx={{ mt: 1 }} />
                </CardContent>
                <Divider />
                <CardActions sx={{ justifyContent: 'space-between', p: 1 }}>
                     <Stack direction="row" spacing={1} alignItems="center" pl={1}>
                        <Tooltip title={`Rata-rata: ${item.rataRataNilai?.toFixed(1) || 'N/A'} | Mengumpulkan: ${item.jumlahSubmission || 0}`}>
                            <Chip icon={<TrendingUpIcon />} label={item.jumlahSubmission || 0} size="small" variant="outlined" />
                        </Tooltip>
                    </Stack>
                    <Stack direction="row" alignItems="center">
                        <Tooltip title="Hapus"><IconButton size="small" color="error" onClick={() => onDelete(item)}><DeleteIcon /></IconButton></Tooltip>
                        <Button size="small" endIcon={<ChevronRightIcon />} onClick={() => navigate(link)}>Detail</Button>
                    </Stack>
                </CardActions>
            </Card>
        </Grid>
    );
};

const EmptyContent = ({ type }) => (
    <Box sx={{ textAlign: 'center', p: 5 }}>
        {type === 'tugas' && <AssignmentIcon sx={{ fontSize: 60, color: 'text.disabled' }} />}
        {type === 'kuis' && <QuizIcon sx={{ fontSize: 60, color: 'text.disabled' }} />}
        {type === 'mahasiswa' && <GroupIcon sx={{ fontSize: 60, color: 'text.disabled' }} />}
        <Typography variant="h6" color="text.secondary" mt={2}>Belum ada {type}</Typography>
    </Box>
);

const MataKuliahDetailDosen = ({ socket }) => {
    const { user } = useContext(AuthContext);
    const { id: mataKuliahId } = useParams();
    const navigate = useNavigate();
    const [mataKuliah, setMataKuliah] = useState(null);
    const [tugasList, setTugasList] = useState([]);
    const [kuisList, setKuisList] = useState([]);
    const [allSubmissions, setAllSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);
    const [anchorEl, setAnchorEl] = useState(null);
    const [tugasDialogOpen, setTugasDialogOpen] = useState(false);
    const [kuisDialogOpen, setKuisDialogOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, type: '', data: null });
    const [unenrollConfirmOpen, setUnenrollConfirmOpen] = useState(false);
    const [mahasiswaToUnenroll, setMahasiswaToUnenroll] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isExporting, setIsExporting] = useState(false);

    const fetchData = useCallback(async () => {
        // Tidak perlu setLoading(true) di sini karena sudah dihandle oleh `useEffect`
        try {
            const [mkRes, tugasRes, kuisRes, submissionsRes] = await Promise.all([
                api.get(`/matakuliah/${mataKuliahId}`),
                api.get(`/tugas/matakuliah/${mataKuliahId}`),
                api.get(`/kuis/matakuliah/${mataKuliahId}`),
                api.get(`/matakuliah/${mataKuliahId}/submissions`)
            ]);
            setMataKuliah(mkRes.data); // mkRes.data sudah berisi rata-rata dari backend
            setTugasList(tugasRes.data);
            setKuisList(kuisRes.data);
            setAllSubmissions(submissionsRes.data);
        } catch (error) { console.error("Gagal memuat data:", error); } 
        finally { setLoading(false); }
    }, [mataKuliahId]);

    useEffect(() => {
        setLoading(true);
        fetchData();
    }, [fetchData]);
    
    useEffect(() => {
        if (!socket) return;
        
        // Cukup panggil fetchData untuk menyinkronkan semua data saat ada update
        const handleDataUpdate = () => {
            fetchData();
        };

        socket.on('tugasStatsUpdated', handleDataUpdate);
        socket.on('kuisStatsUpdated', handleDataUpdate);
        socket.on('mahasiswaListUpdated', handleDataUpdate);

        return () => {
            socket.off('tugasStatsUpdated', handleDataUpdate);
            socket.off('kuisStatsUpdated', handleDataUpdate);
            socket.off('mahasiswaListUpdated', handleDataUpdate);
        };
    }, [socket, fetchData]);

    const prepareExportData = useCallback(() => {
        const allActivities = [
            ...tugasList.map(t => ({...t, type: 'Tugas'})),
            ...kuisList.map(k => ({...k, type: 'Kuis'}))
        ].sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));

        const headers = [
            'NIM', 'Nama Mahasiswa', 'Email', 
            ...allActivities.map(act => `${act.type}: ${act.judul}`),
            'Rata-rata'
        ];

        const dataRows = mataKuliah.mahasiswaIds.map(mhs => {
            const row = {
                'NIM': mhs.nim || 'N/A',
                'Nama Mahasiswa': mhs.nama,
                'Email': mhs.email,
            };

            let totalNilai = 0;
            let countNilai = 0;

            allActivities.forEach(activity => {
                const sub = allSubmissions.find(s => s.mahasiswaId === mhs._id && (s.tugasId === activity._id || s.kuisId === activity._id));
                const nilai = sub ? (sub.nilai ?? sub.skor ?? 'N/A') : 'N/A';
                row[`${activity.type}: ${activity.judul}`] = nilai;

                if(typeof nilai === 'number') {
                    totalNilai += nilai;
                    countNilai++;
                }
            });

            row['Rata-rata'] = countNilai > 0 ? (totalNilai / countNilai).toFixed(2) : 'N/A';
            return row;
        });

        return { headers, dataRows };
    }, [mataKuliah, tugasList, kuisList, allSubmissions]);

    const handleExportExcel = useCallback(() => {
        setIsExporting(true);
        try {
            const { dataRows } = prepareExportData();
            const worksheet = XLSX.utils.json_to_sheet(dataRows);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Nilai");
            XLSX.writeFile(workbook, `Nilai_${mataKuliah.kode}_${mataKuliah.nama}.xlsx`);
        } catch (error) { console.error("Gagal ekspor ke Excel:", error);
        } finally { setIsExporting(false); }
    }, [prepareExportData, mataKuliah]);

    const handleExportPdf = useCallback(() => {
        setIsExporting(true);
        try {
            const { headers, dataRows } = prepareExportData();
            if (dataRows.length === 0) return;

            const doc = new jsPDF({ orientation: 'landscape' });
            
            doc.text(`Laporan Nilai Mata Kuliah: ${mataKuliah.nama} (${mataKuliah.kode})`, 14, 15);
            doc.setFontSize(10);
            doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 22);

            const tableBody = dataRows.map(row => headers.map(header => row[header]));

            autoTable(doc, {
                head: [headers],
                body: tableBody,
                startY: 30,
                theme: 'grid',
                styles: { fontSize: 8, cellPadding: 2 },
                headStyles: { fillColor: [41, 128, 185] },
                alternateRowStyles: { fillColor: [245, 245, 245] },
            });

            doc.save(`Nilai_${mataKuliah.kode}_${mataKuliah.nama}.pdf`);
        } catch (error) {
            console.error("Gagal ekspor ke PDF:", error);
        } finally {
            setIsExporting(false);
        }
    }, [prepareExportData, mataKuliah]);

    const handleTabChange = (event, newValue) => setTabValue(newValue);
    const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const handleOpenDeleteDialog = (item, type) => setDeleteConfirm({ open: true, type, data: item });
    const handleCloseDeleteDialog = () => setDeleteConfirm({ open: false, type: '', data: null });
    const handleDeleteConfirm = async () => {
        const { type, data } = deleteConfirm;
        if (!data) return;
        try {
            await api.delete(`/${type}/${data._id}`);
            if (type === 'tugas') setTugasList(prev => prev.filter(t => t._id !== data._id));
            if (type === 'kuis') setKuisList(prev => prev.filter(k => k._id !== data._id));
        } catch (err) { console.error(err); } 
        finally { handleCloseDeleteDialog(); }
    };
    
    const handleOpenUnenrollDialog = (mahasiswa) => { setMahasiswaToUnenroll(mahasiswa); setUnenrollConfirmOpen(true); };
    const handleCloseUnenrollDialog = () => { setUnenrollConfirmOpen(false); setMahasiswaToUnenroll(null); };
    const handleUnenrollConfirm = async () => { if (!mahasiswaToUnenroll) return; try { await api.delete(`/matakuliah/${mataKuliahId}/unenroll/${mahasiswaToUnenroll._id}`); setMataKuliah(prev => ({ ...prev, mahasiswaIds: prev.mahasiswaIds.filter(m => m._id !== mahasiswaToUnenroll._id) })); handleCloseUnenrollDialog(); } catch (err) { console.error(err); } };

    const filteredMahasiswa = useMemo(() => {
        if (!mataKuliah) return [];
        if (!searchTerm) return mataKuliah.mahasiswaIds;
        return mataKuliah.mahasiswaIds.filter(m => 
            m.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (m.nim && m.nim.includes(searchTerm))
        );
    }, [mataKuliah, searchTerm]);

    const isOwnerOrAdmin = useMemo(() => {
        if (!user || !mataKuliah) return false;
        return user.role === 'admin' || mataKuliah.dosenId._id === user.id;
    }, [user, mataKuliah]);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;
    if (!mataKuliah) return <Typography>Mata Kuliah tidak ditemukan.</Typography>;

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {isOwnerOrAdmin && 
                <PageHeader 
                    mataKuliah={mataKuliah} 
                    onBuatAktivitasClick={handleMenuClick}
                    onExportExcel={handleExportExcel}
                    onExportPdf={handleExportPdf}
                    isExporting={isExporting}
                />
            }

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={() => { setTugasDialogOpen(true); handleMenuClose(); }}><AssignmentIcon sx={{ mr: 1 }}/> Tugas Baru</MenuItem>
                <MenuItem onClick={() => { setKuisDialogOpen(true); handleMenuClose(); }}><QuizIcon sx={{ mr: 1 }}/> Kuis Baru</MenuItem>
            </Menu>

            <Paper>
                <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
                    <Tab icon={<AssignmentIcon />} iconPosition="start" label={`Tugas (${tugasList.length})`} />
                    <Tab icon={<QuizIcon />} iconPosition="start" label={`Kuis (${kuisList.length})`} />
                    <Tab icon={<GroupIcon />} iconPosition="start" label={`Mahasiswa (${mataKuliah.mahasiswaIds.length})`} />
                </Tabs>
                <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, bgcolor: 'background.default', minHeight: '50vh' }}>
                    {tabValue === 0 && (tugasList.length > 0 ? (
                        <Grid container spacing={3}>{tugasList.map(t => <ActivityCard key={t._id} item={t} type="tugas" navigate={navigate} onDelete={(item) => handleOpenDeleteDialog(item, 'tugas')} />)}</Grid>
                    ) : <EmptyContent type="tugas" />)}

                    {tabValue === 1 && (kuisList.length > 0 ? (
                        <Grid container spacing={3}>{kuisList.map(k => <ActivityCard key={k._id} item={k} type="kuis" navigate={navigate} onDelete={(item) => handleOpenDeleteDialog(item, 'kuis')} />)}</Grid>
                    ) : <EmptyContent type="kuis" />)}
                    
                    {tabValue === 2 && (
                        <Box>
                            <TextField fullWidth variant="outlined" placeholder="Cari mahasiswa..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>)}} sx={{ mb: 2, bgcolor: 'background.paper' }} />
                            {filteredMahasiswa.length > 0 ? (
                                <List>{filteredMahasiswa.map(m => (<Paper key={m._id} variant="outlined" sx={{ mb: 1 }}><ListItem secondaryAction={isOwnerOrAdmin && <Tooltip title="Keluarkan"><IconButton edge="end" color="error" onClick={() => handleOpenUnenrollDialog(m)}><PersonRemoveIcon /></IconButton></Tooltip>}><ListItemAvatar><Avatar><PersonIcon /></Avatar></ListItemAvatar><ListItemText primary={m.nama} secondary={`${m.email} - NIM: ${m.nim}`} /></ListItem></Paper>))}</List>
                            ) : <EmptyContent type="mahasiswa" />}
                        </Box>
                    )}
                </Box>
            </Paper>

            <CreateTugasDialog open={tugasDialogOpen} onClose={() => setTugasDialogOpen(false)} mataKuliahId={mataKuliahId} onTugasCreated={(newTugas) => setTugasList(prev => [newTugas, ...prev])} />
            <CreateKuisDialog open={kuisDialogOpen} onClose={() => setKuisDialogOpen(false)} mataKuliahId={mataKuliahId} onKuisCreated={(newKuis) => setKuisList(prev => [newKuis, ...prev])} />
            <Dialog open={deleteConfirm.open} onClose={handleCloseDeleteDialog} fullWidth maxWidth="xs">
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><DeleteIcon color="error" /> Konfirmasi Hapus</DialogTitle>
                <DialogContent><Typography>Anda yakin ingin menghapus <Typography component="span" fontWeight="bold">"{deleteConfirm.data?.judul}"</Typography>? Semua data terkait akan dihapus.</Typography></DialogContent>
                <DialogActions sx={{ p: '16px 24px' }}><Button onClick={handleCloseDeleteDialog}>Batal</Button><Button onClick={handleDeleteConfirm} variant="contained" color="error" startIcon={<DeleteIcon />}>Ya, Hapus</Button></DialogActions>
            </Dialog>
            <Dialog open={unenrollConfirmOpen} onClose={handleCloseUnenrollDialog} fullWidth maxWidth="xs">
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><PersonRemoveIcon color="error" /> Konfirmasi</DialogTitle><DialogContent><Typography>Anda yakin ingin mengeluarkan <Typography component="span" fontWeight="bold">{mahasiswaToUnenroll?.nama}</Typography> dari mata kuliah ini?</Typography></DialogContent><DialogActions sx={{ p: '16px 24px' }}><Button onClick={handleCloseUnenrollDialog}>Batal</Button><Button onClick={handleUnenrollConfirm} variant="contained" color="error" startIcon={<PersonRemoveIcon />}>Ya, Keluarkan</Button></DialogActions></Dialog>
        </Container>
    );
};

export default MataKuliahDetailDosen;