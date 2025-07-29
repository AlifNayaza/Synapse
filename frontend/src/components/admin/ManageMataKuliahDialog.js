import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../services/api';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Typography,
    IconButton, Alert, TextField, FormControl, InputLabel, Select, MenuItem,
    Paper, Tabs, Tab, Divider, Box, CircularProgress, Tooltip, TableContainer, Table,
    TableHead, TableRow, TableCell, TableBody, Grid, useMediaQuery, useTheme,
    ListItemButton, Card, CardContent, Chip, InputAdornment, TableSortLabel, Avatar,
    List, ListItem, ListItemText, ListItemAvatar, CardActions
} from '@mui/material';
import {
    Close as CloseIcon, Edit as EditIcon, Group as GroupIcon,
    Assignment as AssignmentIcon, Quiz as QuizIcon, Assessment as AssessmentIcon,
    PersonRemove as PersonRemoveIcon, Person as PersonIcon, Delete as DeleteIcon,
    Dashboard as DashboardIcon, BarChart as BarChartIcon, Search as SearchIcon,
    Replay as ReplayIcon
} from '@mui/icons-material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns as AdapterDateFnsV2 } from '@mui/x-date-pickers/AdapterDateFns';
import { id as idLocale } from 'date-fns/locale';

// --- Internal Components ---

const OverviewStat = ({ icon, value, label, color }) => (
    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', height: '100%' }}>
        <Avatar sx={{ bgcolor: `${color}.lighter`, color: `${color}.main`, mx: 'auto', mb: 1 }}>{icon}</Avatar>
        <Typography variant="h5" fontWeight="bold">{value}</Typography>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
    </Paper>
);

const LaporanNilaiCard = ({ data }) => {
    const { mhs, nilai, rataRata, tugasList, kuisList } = data;
    return (
        <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                    <Box>
                        <Typography variant="h6" fontWeight={600}>{mhs.nama}</Typography>
                        <Typography variant="body2" color="text.secondary">NIM: {mhs.nim || 'N/A'}</Typography>
                    </Box>
                    <Chip label={`Avg: ${rataRata}`} color="primary" variant="filled" size="small" />
                </Stack>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={2}>
                    <Box>
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>Tugas</Typography>
                        {tugasList.length > 0 ? tugasList.map(item => (
                            <Stack key={item._id} direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                                <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: '70%' }}>{item.judul}</Typography>
                                <Typography variant="body2" fontWeight="medium">{nilai[item._id]}</Typography>
                            </Stack>
                        )) : <Typography variant="caption" color="text.disabled">Tidak ada data.</Typography>}
                    </Box>
                    <Box>
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>Kuis</Typography>
                        {kuisList.length > 0 ? kuisList.map(item => (
                            <Stack key={item._id} direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                                <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: '70%' }}>{item.judul}</Typography>
                                <Typography variant="body2" fontWeight="medium">{nilai[item._id]}</Typography>
                            </Stack>
                        )) : <Typography variant="caption" color="text.disabled">Tidak ada data.</Typography>}
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
};

const MahasiswaListCard = ({ mahasiswa, onAction }) => (
    <Card variant="outlined" sx={{ mb: 1 }}>
        <ListItem
            secondaryAction={
                <Tooltip title="Keluarkan">
                    <IconButton size="small" color="error" onClick={() => onAction('unenroll', mahasiswa)}>
                        <PersonRemoveIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            }
        >
            <ListItemAvatar><Avatar><PersonIcon /></Avatar></ListItemAvatar>
            <ListItemText
                primary={mahasiswa.nama}
                secondary={`NIM: ${mahasiswa.nim || 'N/A'}`}
            />
        </ListItem>
    </Card>
);

const ActivityListCard = ({ item, type, mahasiswaCount, onAction }) => {
    const formatDateTime = (dateString) => new Date(dateString).toLocaleString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    return (
        <Card variant="outlined" sx={{ mb: 1.5 }}>
            <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                    <Typography variant="h6" fontWeight={500}>{item.judul}</Typography>
                    <Chip label={`${item.jumlahSubmission || 0}/${mahasiswaCount}`} size="small" />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                    Tenggat: {formatDateTime(item.tenggat)}
                </Typography>
            </CardContent>
            <Divider />
            <CardActions sx={{ justifyContent: 'flex-end' }}>
                 <Tooltip title="Hapus">
                    <IconButton size="small" color="error" onClick={() => onAction('delete', item)}>
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </CardActions>
        </Card>
    );
};

const LaporanNilaiTab = ({ data, tugasList, kuisList, isMobile }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'nama', direction: 'asc' });

    const handleReset = () => {
        setSearchTerm('');
        setSortConfig({ key: 'nama', direction: 'asc' });
    };

    const isFiltered = searchTerm !== '' || sortConfig.key !== 'nama' || sortConfig.direction !== 'asc';

    const processedData = useMemo(() => {
        let sortedData = [...data];
        if (searchTerm) {
            const lowerCaseSearch = searchTerm.toLowerCase();
            sortedData = sortedData.filter(item => item.mhs.nama.toLowerCase().includes(lowerCaseSearch) || (item.mhs.nim && item.mhs.nim.includes(lowerCaseSearch)));
        }
        sortedData.sort((a, b) => {
            let aValue = a.mhs[sortConfig.key] || a[sortConfig.key];
            let bValue = b.mhs[sortConfig.key] || b[sortConfig.key];
            if (sortConfig.key === 'rataRata') { aValue = parseFloat(a.rataRata) || -1; bValue = parseFloat(b.rataRata) || -1; }
            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return sortedData;
    }, [data, searchTerm, sortConfig]);

    return (
        <Box>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField fullWidth size="small" placeholder="Cari mahasiswa..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} />
                    <FormControl size="small" fullWidth>
                        <InputLabel>Urutkan</InputLabel>
                        <Select value={`${sortConfig.key}-${sortConfig.direction}`} label="Urutkan" onChange={(e) => { const [key, direction] = e.target.value.split('-'); setSortConfig({ key, direction }); }}>
                            <MenuItem value="nama-asc">Nama (A-Z)</MenuItem><MenuItem value="nama-desc">Nama (Z-A)</MenuItem>
                            <MenuItem value="nim-asc">NIM (Asc)</MenuItem><MenuItem value="nim-desc">NIM (Desc)</MenuItem>
                            <MenuItem value="rataRata-desc">Rata-rata (Tertinggi)</MenuItem><MenuItem value="rataRata-asc">Rata-rata (Terendah)</MenuItem>
                        </Select>
                    </FormControl>
                    <Button variant="outlined" size="small" onClick={handleReset} disabled={!isFiltered} startIcon={<ReplayIcon />} sx={{ flexShrink: 0 }}>Reset</Button>
                </Stack>
            </Box>
            {isMobile ? (<Box sx={{ p: 2 }}>{processedData.map(item => <LaporanNilaiCard key={item.mhs._id} data={item} />)}</Box>
            ) : (
                <TableContainer><Table stickyHeader size="small"><TableHead><TableRow><TableCell>Mahasiswa</TableCell>{tugasList.map(t => <TableCell key={t._id} align="center">{t.judul}</TableCell>)}{kuisList.map(k => <TableCell key={k._id} align="center">{k.judul}</TableCell>)}<TableCell align="center">Rata-rata</TableCell></TableRow></TableHead>
                <TableBody>{processedData.map(({ mhs, nilai, rataRata }) => (<TableRow key={mhs._id} hover><TableCell><Typography variant="body2" fontWeight="medium">{mhs.nama}</Typography><Typography variant="caption" color="text.secondary">NIM: {mhs.nim || 'N/A'}</Typography></TableCell>{tugasList.map(t => <TableCell key={t._id} align="center">{nilai[t._id]}</TableCell>)}{kuisList.map(k => <TableCell key={k._id} align="center">{nilai[k._id]}</TableCell>)}<TableCell align="center" sx={{ fontWeight: 'bold' }}>{rataRata}</TableCell></TableRow>))}</TableBody>
                </Table></TableContainer>
            )}
        </Box>
    );
};

const MahasiswaTabContent = ({ items, onAction, isMobile }) => {
    const [sortConfig, setSortConfig] = useState({ key: 'nama', direction: 'asc' });
    const [searchTerm, setSearchTerm] = useState('');
    
    const handleReset = () => {
        setSearchTerm('');
        setSortConfig({ key: 'nama', direction: 'asc' });
    };

    const isFiltered = searchTerm !== '' || sortConfig.key !== 'nama' || sortConfig.direction !== 'asc';

    const processedItems = useMemo(() => {
        let filteredItems = [...items];
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            filteredItems = filteredItems.filter(m => m.nama.toLowerCase().includes(lower) || (m.nim && m.nim.includes(lower)));
        }
        filteredItems.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
            if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return filteredItems;
    }, [items, sortConfig, searchTerm]);
    
    const handleSortRequest = (key) => {
        const isAsc = sortConfig.key === key && sortConfig.direction === 'asc';
        setSortConfig({ key, direction: isAsc ? 'desc' : 'asc' });
    };

    return (
        <Box>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Stack direction="row" spacing={2}>
                    <TextField fullWidth size="small" placeholder="Cari mahasiswa..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} />
                    <Button variant="outlined" size="small" onClick={handleReset} disabled={!isFiltered} startIcon={<ReplayIcon />}>Reset</Button>
                </Stack>
            </Box>
            {isMobile ? (
                <Box sx={{ p: 2 }}>
                    {processedItems.map(m => <MahasiswaListCard key={m._id} mahasiswa={m} onAction={onAction} />)}
                </Box>
            ) : (
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sortDirection={sortConfig.key === 'nama' ? sortConfig.direction : false}><TableSortLabel active={sortConfig.key === 'nama'} direction={sortConfig.direction} onClick={() => handleSortRequest('nama')}>Nama</TableSortLabel></TableCell>
                                <TableCell sortDirection={sortConfig.key === 'nim' ? sortConfig.direction : false}><TableSortLabel active={sortConfig.key === 'nim'} direction={sortConfig.direction} onClick={() => handleSortRequest('nim')}>NIM</TableSortLabel></TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell align="right">Aksi</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {processedItems.map(m => (
                                <TableRow key={m._id} hover>
                                    <TableCell>{m.nama}</TableCell>
                                    <TableCell>{m.nim || 'N/A'}</TableCell>
                                    <TableCell>{m.email}</TableCell>
                                    <TableCell align="right"><Tooltip title="Keluarkan"><IconButton size="small" color="error" onClick={() => onAction('unenroll', m)}><PersonRemoveIcon fontSize="small" /></IconButton></Tooltip></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

const ActivityTabContent = ({ items, type, mahasiswaCount, onAction, isMobile }) => {
    const [sortConfig, setSortConfig] = useState({ key: 'tenggat', direction: 'desc' });
    const [dateFilter, setDateFilter] = useState({ start: null, end: null });

    const handleReset = () => {
        setDateFilter({ start: null, end: null });
        setSortConfig({ key: 'tenggat', direction: 'desc' });
    };
    
    const isFiltered = dateFilter.start || dateFilter.end || sortConfig.key !== 'tenggat' || sortConfig.direction !== 'desc';

    const formatDateTime = (dateString) => new Date(dateString).toLocaleString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const processedItems = useMemo(() => {
        let filteredItems = [...items];
        if (dateFilter.start) filteredItems = filteredItems.filter(item => new Date(item.tenggat) >= dateFilter.start);
        if (dateFilter.end) {
            const endDate = new Date(dateFilter.end);
            endDate.setHours(23, 59, 59, 999); // Set to end of day
            filteredItems = filteredItems.filter(item => new Date(item.tenggat) <= endDate);
        }
        filteredItems.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
            if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return filteredItems;
    }, [items, sortConfig, dateFilter]);

    const handleSortRequest = (key) => {
        const isAsc = sortConfig.key === key && sortConfig.direction === 'asc';
        setSortConfig({ key, direction: isAsc ? 'desc' : 'asc' });
    };

    return (
        <Box>
            <LocalizationProvider dateAdapter={AdapterDateFnsV2} adapterLocale={idLocale}>
                <Stack direction={{xs: 'column', md: 'row'}} spacing={2} sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <DateTimePicker label="Dari Tanggal" value={dateFilter.start} onChange={(date) => setDateFilter(prev => ({...prev, start: date}))} slotProps={{ textField: { size: 'small', fullWidth: true } }}/>
                    <DateTimePicker label="Sampai Tanggal" value={dateFilter.end} onChange={(date) => setDateFilter(prev => ({...prev, end: date}))} slotProps={{ textField: { size: 'small', fullWidth: true } }}/>
                    <Button variant="outlined" size="small" onClick={handleReset} disabled={!isFiltered} startIcon={<ReplayIcon />} sx={{ flexShrink: 0 }}>Reset</Button>
                </Stack>
            </LocalizationProvider>
            {isMobile ? (
                <Box sx={{ p: 2 }}>{processedItems.map(item => <ActivityListCard key={item._id} item={item} type={type} mahasiswaCount={mahasiswaCount} onAction={onAction} />)}</Box>
            ) : (
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sortDirection={sortConfig.key === 'judul' ? sortConfig.direction : false}><TableSortLabel active={sortConfig.key === 'judul'} direction={sortConfig.direction} onClick={() => handleSortRequest('judul')}>Judul</TableSortLabel></TableCell>
                                <TableCell sortDirection={sortConfig.key === 'tenggat' ? sortConfig.direction : false}><TableSortLabel active={sortConfig.key === 'tenggat'} direction={sortConfig.direction} onClick={() => handleSortRequest('tenggat')}>Tenggat</TableSortLabel></TableCell>
                                <TableCell align="center">Pengumpulan</TableCell>
                                <TableCell align="right">Aksi</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {processedItems.map(item => (
                                <TableRow key={item._id} hover>
                                    <TableCell>{item.judul}</TableCell>
                                    <TableCell>{formatDateTime(item.tenggat)}</TableCell>
                                    <TableCell align="center">{item.jumlahSubmission || 0} / {mahasiswaCount}</TableCell>
                                    <TableCell align="right"><Tooltip title="Hapus"><IconButton size="small" color="error" onClick={() => onAction('delete', item)}><DeleteIcon fontSize="small" /></IconButton></Tooltip></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

const ManageMataKuliahDialog = ({ open, onClose, mataKuliah, onActionSuccess, socket }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    const [mode, setMode] = useState('view');
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [details, setDetails] = useState({ tugas: [], kuis: [], mahasiswa: [], submissions: [] });
    const [formData, setFormData] = useState({ nama: '', kode: '', deskripsi: '', dosenId: '' });
    const [dosenList, setDosenList] = useState([]);
    const [confirmState, setConfirmState] = useState({ open: false, type: null, data: null, title: '', message: '' });

    const fetchDetails = useCallback(async () => {
        if (!mataKuliah) return;
        setLoading(true);
        try {
            const [tugasRes, kuisRes, submissionsRes] = await Promise.all([
                api.get(`/tugas/matakuliah/${mataKuliah._id}`),
                api.get(`/kuis/matakuliah/${mataKuliah._id}`),
                api.get(`/matakuliah/${mataKuliah._id}/submissions`)
            ]);
            setDetails({
                tugas: tugasRes.data, kuis: kuisRes.data,
                submissions: submissionsRes.data, mahasiswa: mataKuliah.mahasiswaIds || []
            });
        } catch (err) { setError("Gagal memuat detail data.");
        } finally { setLoading(false); }
    }, [mataKuliah]);

    useEffect(() => {
        if (open && mataKuliah) {
            setMode('view'); setActiveTab('overview');
            setFormData({
                nama: mataKuliah.nama || '', kode: mataKuliah.kode || '',
                deskripsi: mataKuliah.deskripsi || '', dosenId: mataKuliah.dosenId?._id || ''
            });
            fetchDetails();
        }
    }, [open, mataKuliah, fetchDetails]);

    useEffect(() => {
        if (!socket || !open) return;
        const handleDataChange = () => fetchDetails();
        socket.on('dataChanged', handleDataChange);
        return () => socket.off('dataChanged', handleDataChange);
    }, [socket, open, fetchDetails]);

    useEffect(() => {
        if (mode === 'edit' && dosenList.length === 0) {
            api.get('/admin/users').then(res => setDosenList(res.data.filter(user => user.role === 'dosen'))).catch(console.error);
        }
    }, [mode, dosenList]);
    
    const laporanTableData = useMemo(() => {
        if (loading) return [];
        return details.mahasiswa.map(mhs => {
            const nilai = {}; let totalNilai = 0; let count = 0;
            details.tugas.forEach(t => { const sub = details.submissions.find(s => s.mahasiswaId === mhs._id && s.tugasId === t._id); nilai[t._id] = sub?.status === 'dinilai' ? sub.nilai : '-'; if (typeof sub?.nilai === 'number') { totalNilai += sub.nilai; count++; }});
            details.kuis.forEach(k => { const sub = details.submissions.find(s => s.mahasiswaId === mhs._id && s.kuisId === k._id); nilai[k._id] = sub?.status === 'dinilai' ? sub.skor : '-'; if (typeof sub?.skor === 'number') { totalNilai += sub.skor; count++; }});
            const rataRata = count > 0 ? (totalNilai / count).toFixed(1) : '-';
            return { mhs, nilai, rataRata, tugasList: details.tugas, kuisList: details.kuis };
        });
    }, [details, loading]);

    if (!mataKuliah) return null;

    const handleEditSubmit = async () => {
        setLoading(true); setError('');
        try {
            await api.put(`/admin/matakuliah/${mataKuliah._id}`, formData);
            onActionSuccess('Mata kuliah berhasil diperbarui.');
            onClose();
        } catch (err) { setError(err.response?.data?.message || 'Gagal memperbarui.'); } finally { setLoading(false); }
    };
    
    const openConfirmDialog = (type, data, title, message) => setConfirmState({ open: true, type, data, title, message });
    
    const handleConfirmAction = async () => {
        const { type, data } = confirmState;
        try {
            let message = '';
            if (type === 'unenroll') {
                await api.delete(`/matakuliah/${mataKuliah._id}/unenroll/${data._id}`);
                setDetails(prev => ({ ...prev, mahasiswa: prev.mahasiswa.filter(m => m._id !== data._id) }));
                message = `Mahasiswa ${data.nama} berhasil dikeluarkan.`;
            } else if (type === 'deleteTugas' || type === 'deleteKuis') {
                const endpoint = type === 'deleteTugas' ? `/tugas/${data._id}` : `/kuis/${data._id}`;
                await api.delete(endpoint);
                const listKey = type === 'deleteTugas' ? 'tugas' : 'kuis';
                setDetails(prev => ({...prev, [listKey]: prev[listKey].filter(item => item._id !== data._id)}));
                message = `${type === 'deleteTugas' ? 'Tugas' : 'Kuis'} "${data.judul}" berhasil dihapus.`;
            }
            onActionSuccess(message);
        } catch (err) { onActionSuccess(err.response?.data?.message || 'Terjadi kesalahan', 'error');
        } finally { setConfirmState({ open: false, type: null, data: null, title: '', message: '' }); }
    };

    const navItems = [
        { id: 'overview', label: 'Ringkasan', icon: <DashboardIcon /> },
        { id: 'mahasiswa', label: `Mahasiswa`, count: details.mahasiswa.length, icon: <GroupIcon /> },
        { id: 'tugas', label: `Tugas`, count: details.tugas.length, icon: <AssignmentIcon /> },
        { id: 'kuis', label: `Kuis`, count: details.kuis.length, icon: <QuizIcon /> },
        { id: 'laporan', label: 'Laporan Nilai', icon: <AssessmentIcon /> },
    ];

    const renderTabContent = () => {
        if (loading) return <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;
        
        switch (activeTab) {
            case 'overview':
                const gradedCount = details.submissions.filter(s => s.status === 'dinilai').length;
                return <Box sx={{ p: { xs: 2, sm: 3 } }}><Typography variant="h6" gutterBottom>Ringkasan</Typography><Grid container spacing={2}><Grid item xs={6}><OverviewStat icon={<GroupIcon/>} value={details.mahasiswa.length} label="Mahasiswa" color="primary"/></Grid><Grid item xs={6}><OverviewStat icon={<AssignmentIcon/>} value={details.tugas.length} label="Tugas" color="info"/></Grid><Grid item xs={6}><OverviewStat icon={<QuizIcon/>} value={details.kuis.length} label="Kuis" color="secondary"/></Grid><Grid item xs={6}><OverviewStat icon={<BarChartIcon/>} value={`${gradedCount}/${details.submissions.length}`} label="Dinilai" color="success"/></Grid></Grid></Box>;
            case 'mahasiswa':
                return <MahasiswaTabContent items={details.mahasiswa} onAction={(action, data) => openConfirmDialog(action, data, 'Keluarkan Mahasiswa', `Yakin ingin mengeluarkan ${data.nama}?`)} isMobile={isMobile} />;
            case 'tugas':
                return <ActivityTabContent items={details.tugas} type="tugas" mahasiswaCount={details.mahasiswa.length} onAction={(action, data) => openConfirmDialog('deleteTugas', data, 'Hapus Tugas', `Yakin ingin menghapus "${data.judul}"?`)} isMobile={isMobile} />;
            case 'kuis':
                return <ActivityTabContent items={details.kuis} type="kuis" mahasiswaCount={details.mahasiswa.length} onAction={(action, data) => openConfirmDialog('deleteKuis', data, 'Hapus Kuis', `Yakin ingin menghapus "${data.judul}"?`)} isMobile={isMobile} />;
            case 'laporan':
                return <LaporanNilaiTab data={laporanTableData} tugasList={details.tugas} kuisList={details.kuis} isMobile={isMobile} />;
            default: return null;
        }
    };
    
    return (
        <>
            <Dialog open={open} onClose={onClose} fullScreen={isMobile} fullWidth maxWidth="xl" PaperProps={{ sx: { height: isMobile ? '100%' : '90vh', maxHeight: { sm: '800px' } } }}>
                <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider', p: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box sx={{ maxWidth: 'calc(100% - 120px)'}}><Typography variant="h6" noWrap>{mataKuliah.nama}</Typography><Typography variant="body2" color="text.secondary" noWrap>{`${mataKuliah.kode} • ${mataKuliah.dosenId?.nama || 'N/A'}`}</Typography></Box>
                        <Stack direction="row" spacing={1}><Button size="small" variant="outlined" startIcon={<EditIcon />} onClick={() => setMode('edit')}>Edit</Button><IconButton onClick={onClose}><CloseIcon /></IconButton></Stack>
                    </Stack>
                </DialogTitle>
                <DialogContent sx={{ p: 0, bgcolor: 'background.default', display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, overflow: 'hidden' }}>
                    {isMobile ? (
                        <Paper square elevation={1}><Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>{navItems.map(item => <Tab key={item.id} value={item.id} icon={item.icon} aria-label={item.label} sx={{minWidth: 60}} />)}</Tabs></Paper>
                    ) : (
                        <Box sx={{ borderRight: 1, borderColor: 'divider', width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
                            <List component="nav" sx={{ p: 1, flexGrow: 1, overflowY: 'auto' }}>{navItems.map(item => (
                                <ListItemButton key={item.id} selected={activeTab === item.id} onClick={() => setActiveTab(item.id)}>
                                    <ListItemAvatar sx={{minWidth: 40}}><Avatar sx={{width: 32, height: 32}}>{item.icon}</Avatar></ListItemAvatar>
                                    <ListItemText primary={item.label} secondary={item.count != null ? `${item.count} item` : null} />
                                </ListItemButton>
                            ))}</List>
                        </Box>
                    )}
                     <Box sx={{ flexGrow: 1, overflowY: 'auto', bgcolor: 'background.paper' }}>
                        {mode === 'edit' ? (
                            <Stack spacing={2} sx={{ p: { xs: 2, sm: 3 } }}>
                                <Typography variant="h6">Edit Detail Mata Kuliah</Typography>
                                {error && <Alert severity="error">{error}</Alert>}
                                <TextField name="nama" label="Nama Mata Kuliah" fullWidth value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} />
                                <TextField name="kode" label="Kode Mata Kuliah" fullWidth value={formData.kode} onChange={e => setFormData({...formData, kode: e.target.value})} />
                                <TextField name="deskripsi" label="Deskripsi" fullWidth multiline rows={4} value={formData.deskripsi} onChange={e => setFormData({...formData, deskripsi: e.target.value})} />
                                <FormControl fullWidth><InputLabel>Dosen Pengampu</InputLabel><Select name="dosenId" value={formData.dosenId} label="Dosen Pengampu" onChange={e => setFormData({...formData, dosenId: e.target.value})}>{dosenList.map(dosen => <MenuItem key={dosen._id} value={dosen._id}>{dosen.nama}</MenuItem>)}</Select></FormControl>
                            </Stack>
                        ) : renderTabContent()}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ borderTop: 1, borderColor: 'divider' }}>
                    {mode === 'edit' ? (<><Button onClick={() => { setMode('view'); setError(''); }}>Batal</Button><Button onClick={handleEditSubmit} variant="contained" disabled={loading}>Simpan</Button></>) : (<Button onClick={onClose}>Tutup</Button>)}
                </DialogActions>
            </Dialog>

            <Dialog open={confirmState.open} onClose={() => setConfirmState(s => ({...s, open: false}))} fullWidth maxWidth="xs">
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><DeleteIcon color="error" /> {confirmState.title}</DialogTitle>
                <DialogContent><Typography>{confirmState.message}</Typography></DialogContent>
                <DialogActions sx={{p:'16px 24px'}}><Button onClick={() => setConfirmState(s=>({...s, open: false}))}>Batal</Button><Button onClick={handleConfirmAction} variant="contained" color="error">Ya</Button></DialogActions>
            </Dialog>
        </>
    );
};

export default ManageMataKuliahDialog;