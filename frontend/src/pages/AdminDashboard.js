import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
    Container, Typography, Box, Paper, Button, CircularProgress, Dialog,
    DialogTitle, DialogContent, TextField, DialogActions, Alert,
    Tabs, Tab, IconButton, Tooltip, Grid, Stack, Snackbar,
    ListItemButton, Divider, Card, Checkbox, FormControlLabel,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel,
    List, ListItem, ListItemAvatar, Avatar, ListItemText, InputAdornment, FormControl, InputLabel, Select, MenuItem, Chip
} from '@mui/material';
import { 
    PersonAdd as PersonAddIcon, School as DosenIcon, Face as MahasiswaIcon, 
    Delete as DeleteIcon, Close as CloseIcon, Group as GroupIcon, 
    MenuBook as MenuBookIcon, Assignment as AssignmentIcon, Search as SearchIcon,
    Checklist as ChecklistIcon, Cancel as CancelIcon
} from '@mui/icons-material';
import ManageMataKuliahDialog from '../components/admin/ManageMataKuliahDialog';

const StatCard = ({ icon, value, label, color }) => (
    <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, height: '100%' }}>
        <Avatar sx={{ bgcolor: `${color}.lighter`, color: `${color}.main`, width: 48, height: 48 }}>{icon}</Avatar>
        <Box>
            <Typography variant="h5" fontWeight="bold">{value}</Typography>
            <Typography variant="body2" color="text.secondary">{label}</Typography>
        </Box>
    </Paper>
);

// --- PERUBAHAN DI SINI ---
const WelcomeBanner = ({ onAddDosenClick }) => (
    <Card sx={{ mb: 4, position: 'relative', color: 'common.white', p: 4 }}>
        <Box sx={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            // Ganti URL online dengan path ke gambar di folder public
            backgroundImage: 'url(/admin.jpg)', 
            backgroundSize: 'cover', backgroundPosition: 'center',
            filter: 'brightness(0.4)', zIndex: 1, borderRadius: (theme) => theme.shape.borderRadius + 'px'
        }}/>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" spacing={2} sx={{ position: 'relative', zIndex: 2 }}>
            <Box>
                <Typography variant="h4" fontWeight="bold">Admin Dashboard</Typography>
                <Typography sx={{ opacity: 0.9 }}>Manajemen dan monitoring platform secara terpusat.</Typography>
            </Box>
            <Button variant="contained" size="large" color="secondary" startIcon={<PersonAddIcon />} onClick={onAddDosenClick}>
                Tambah Dosen
            </Button>
        </Stack>
    </Card>
);
// --- AKHIR PERUBAHAN ---

const CreateDosenDialog = ({ open, onClose, onActionSuccess }) => {
    const [nama, setNama] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const handleSubmit = async () => {
        setError(''); setSubmitting(true);
        try {
            const res = await api.post('/admin/create-dosen', { nama, email, password });
            onActionSuccess(res.data.message);
            handleClose();
        } catch (err) { setError(err.response?.data?.message || 'Gagal membuat akun dosen.'); } finally { setSubmitting(false); }
    };
    const handleClose = () => { setNama(''); setEmail(''); setPassword(''); setError(''); onClose(); };
    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle><Stack direction="row" justifyContent="space-between" alignItems="center"><Typography variant="h6">Tambah Akun Dosen Baru</Typography><IconButton onClick={handleClose}><CloseIcon /></IconButton></Stack></DialogTitle>
            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <TextField autoFocus margin="dense" label="Nama Lengkap Dosen" fullWidth value={nama} onChange={e => setNama(e.target.value)} />
                <TextField margin="dense" label="Email Dosen" type="email" fullWidth value={email} onChange={e => setEmail(e.target.value)} />
                <TextField margin="dense" label="Password Awal" type="password" fullWidth value={password} onChange={e => setPassword(e.target.value)} />
            </DialogContent>
            <DialogActions sx={{ p: 3 }}><Button onClick={handleClose} variant="outlined">Batal</Button><Button onClick={handleSubmit} variant="contained" disabled={submitting}>{submitting ? <CircularProgress size={24} /> : 'Tambah Dosen'}</Button></DialogActions>
        </Dialog>
    );
};

const AdminDashboard = ({ socket }) => {
    const navigate = useNavigate();
    const [data, setData] = useState({ users: [], mataKuliah: [], stats: { users: 0, mataKuliah: 0, aktivitas: 0 } });
    const [loading, setLoading] = useState(true);
    const [dosenDialogOpen, setDosenDialogOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, type: null, data: null });
    const [manageMk, setManageMk] = useState({ open: false, data: null });
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
    const [tabValue, setTabValue] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectionMode, setSelectionMode] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [usersRes, statsRes, mkRes] = await Promise.all([api.get('/admin/users'), api.get('/admin/stats'), api.get('/matakuliah')]);
            setData({ users: usersRes.data, stats: statsRes.data, mataKuliah: mkRes.data });
        } catch (error) { showNotification('Gagal memuat data.', 'error'); } 
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        if (!socket) return;
        const handleDataChange = (payload) => {
            showNotification('Dashboard diperbarui secara real-time!', 'info');
            fetchData();
        };
        socket.on('dataChanged', handleDataChange);
        return () => { socket.off('dataChanged', handleDataChange); };
    }, [socket, fetchData]);
    
    const showNotification = (message, severity = 'success') => setNotification({ open: true, message, severity });

    const processedUsers = useMemo(() => {
        let users = [...data.users];
        if (roleFilter !== 'all') { users = users.filter(user => user.role === roleFilter); }
        if (searchTerm) {
            const lowerCaseSearch = searchTerm.toLowerCase();
            users = users.filter(u => 
                u.nama.toLowerCase().includes(lowerCaseSearch) || 
                u.email.toLowerCase().includes(lowerCaseSearch) || 
                (u.nim && u.nim.includes(lowerCaseSearch))
            );
        }
        users.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
            if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return users;
    }, [data.users, searchTerm, roleFilter, sortConfig]);

    const filteredMataKuliah = useMemo(() => 
        data.mataKuliah.filter(mk => 
            mk.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
            mk.kode.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (mk.dosenId && mk.dosenId.nama.toLowerCase().includes(searchTerm.toLowerCase()))
        ), [data.mataKuliah, searchTerm]);

    const handleSortRequest = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') { direction = 'desc'; }
        setSortConfig({ key, direction });
    };

    const handleUserSelect = (userId) => { setSelectedUsers(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]); };
    const handleSelectAllUsers = (event) => { setSelectedUsers(event.target.checked ? processedUsers.map(u => u._id) : []); };
    
    const openDeleteConfirm = (type, data) => setDeleteConfirm({ open: true, type, data });
    const closeDeleteConfirm = () => setDeleteConfirm({ open: false, type: null, data: null });
    
    const handleDelete = async () => {
        const { type, data } = deleteConfirm;
        try {
            let res;
            if (type === 'user') { res = await api.delete(`/admin/users/${data._id}`); } 
            else if (type === 'mk') { res = await api.delete(`/admin/matakuliah/${data._id}`); } 
            else if (type === 'multiple-users') {
                res = await api.post('/admin/users/delete-multiple', { userIds: data });
                setSelectedUsers([]);
                setSelectionMode(false);
            }
            showNotification(res.data.message);
        } catch (err) { showNotification(err.response?.data?.message || 'Gagal menghapus.', 'error'); 
        } finally { closeDeleteConfirm(); }
    };
    
    const handleOpenManageMkDialog = (mk) => setManageMk({ open: true, data: mk });
    const handleCloseManageMkDialog = () => setManageMk({ open: false, data: null });
    
    const handleTabChange = (event, newValue) => { 
        setSearchTerm(''); setSelectedUsers([]); setSelectionMode(false); setTabValue(newValue); 
    };
    
    const toggleSelectionMode = () => { setSelectionMode(!selectionMode); setSelectedUsers([]); };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <WelcomeBanner onAddDosenClick={() => setDosenDialogOpen(true)} />
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}><StatCard icon={<GroupIcon />} value={data.stats.users} label="Total Pengguna" color="primary" /></Grid>
                <Grid item xs={12} md={4}><StatCard icon={<MenuBookIcon />} value={data.stats.mataKuliah} label="Total Mata Kuliah" color="secondary" /></Grid>
                <Grid item xs={12} md={4}><StatCard icon={<AssignmentIcon />} value={data.stats.aktivitas} label="Total Aktivitas" color="info" /></Grid>
            </Grid>
            <Paper>
                <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
                    <Tab icon={<GroupIcon />} iconPosition="start" label={`Pengguna (${data.users.length})`} />
                    <Tab icon={<MenuBookIcon />} iconPosition="start" label={`Mata Kuliah (${data.mataKuliah.length})`} />
                </Tabs>
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                    {tabValue === 0 ? (
                        <Stack direction={{xs: 'column', sm: 'row'}} spacing={2}>
                            <TextField fullWidth size="small" placeholder="Cari pengguna..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} InputProps={{ startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} /> }} />
                            <FormControl size="small" sx={{minWidth: 150}}>
                                <InputLabel>Filter Role</InputLabel>
                                <Select value={roleFilter} label="Filter Role" onChange={(e) => setRoleFilter(e.target.value)}>
                                    <MenuItem value="all">Semua Role</MenuItem>
                                    <MenuItem value="dosen">Dosen</MenuItem>
                                    <MenuItem value="mahasiswa">Mahasiswa</MenuItem>
                                </Select>
                            </FormControl>
                            <Button variant="outlined" onClick={toggleSelectionMode} startIcon={selectionMode ? <CancelIcon /> : <ChecklistIcon />}>
                                {selectionMode ? 'Batal' : 'Pilih'}
                            </Button>
                        </Stack>
                    ) : (
                        <TextField fullWidth size="small" placeholder="Cari mata kuliah..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} InputProps={{ startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} /> }} />
                    )}
                </Box>
                
                {tabValue === 0 && (
                    <TableContainer>
                        {selectionMode && (
                            <Box sx={{ px: 2, py:1, display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'action.hover' }}>
                                <FormControlLabel sx={{flexShrink: 0}} control={<Checkbox checked={processedUsers.length > 0 && selectedUsers.length === processedUsers.length} indeterminate={selectedUsers.length > 0 && selectedUsers.length < processedUsers.length} onChange={handleSelectAllUsers}/>} label={`Pilih Semua (${selectedUsers.length})`}/>
                                <Box sx={{ flexGrow: 1 }} />
                                {selectedUsers.length > 0 && <Button variant="contained" color="error" size="small" startIcon={<DeleteIcon />} onClick={() => openDeleteConfirm('multiple-users', selectedUsers)}>Hapus</Button>}
                            </Box>
                        )}
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {selectionMode && <TableCell padding="checkbox"></TableCell>}
                                    <TableCell sortDirection={sortConfig.key === 'nama' ? sortConfig.direction : false}><TableSortLabel active={sortConfig.key === 'nama'} direction={sortConfig.key === 'nama' ? sortConfig.direction : 'asc'} onClick={() => handleSortRequest('nama')}>Nama</TableSortLabel></TableCell>
                                    <TableCell>Email / NIM</TableCell>
                                    <TableCell>Role</TableCell>
                                    <TableCell sortDirection={sortConfig.key === 'createdAt' ? sortConfig.direction : false}><TableSortLabel active={sortConfig.key === 'createdAt'} direction={sortConfig.key === 'createdAt' ? sortConfig.direction : 'asc'} onClick={() => handleSortRequest('createdAt')}>Tanggal Dibuat</TableSortLabel></TableCell>
                                    {!selectionMode && <TableCell align="right">Aksi</TableCell>}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {processedUsers.map(user => (
                                    <TableRow key={user._id} hover selected={selectedUsers.includes(user._id)}>
                                        {selectionMode && <TableCell padding="checkbox"><Checkbox checked={selectedUsers.includes(user._id)} onChange={() => handleUserSelect(user._id)}/></TableCell>}
                                        <TableCell><Stack direction="row" spacing={2} alignItems="center"><Avatar sx={{ bgcolor: user.role === 'dosen' ? 'primary.main' : 'secondary.main' }}>{user.role === 'dosen' ? <DosenIcon fontSize="small"/> : <MahasiswaIcon fontSize="small"/>}</Avatar><Typography variant="body2" fontWeight="medium">{user.nama}</Typography></Stack></TableCell>
                                        <TableCell><Typography variant="body2">{user.email}</Typography>{user.nim && <Typography variant="caption" color="text.secondary">NIM: {user.nim}</Typography>}</TableCell>
                                        <TableCell><Chip label={user.role} size="small" color={user.role === 'dosen' ? 'primary' : 'secondary'} /></TableCell>
                                        <TableCell>{new Date(user.createdAt).toLocaleDateString('id-ID')}</TableCell>
                                        {!selectionMode && <TableCell align="right"><Tooltip title={`Hapus ${user.nama}`}><IconButton size="small" color="error" onClick={() => openDeleteConfirm('user', user)}><DeleteIcon /></IconButton></Tooltip></TableCell>}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
                {tabValue === 1 && (
                    <List sx={{ maxHeight: 500, overflow: 'auto' }}>
                        {filteredMataKuliah.map(mk => (
                            <ListItem 
                                key={mk._id} 
                                divider 
                                secondaryAction={<Tooltip title={`Hapus ${mk.nama}`}><IconButton edge="end" color="error" onClick={() => openDeleteConfirm('mk', mk)}><DeleteIcon /></IconButton></Tooltip>} 
                                disablePadding
                            >
                                <ListItemButton onClick={() => handleOpenManageMkDialog(mk)}>
                                    <ListItemAvatar><Avatar sx={{ bgcolor: 'info.main' }}><MenuBookIcon /></Avatar></ListItemAvatar>
                                    <ListItemText primary={`${mk.nama} (${mk.kode})`} secondary={`Dosen: ${mk.dosenId?.nama || 'N/A'}`} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                )}
            </Paper>

            <CreateDosenDialog open={dosenDialogOpen} onClose={() => setDosenDialogOpen(false)} onActionSuccess={showNotification} />
            <ManageMataKuliahDialog open={manageMk.open} onClose={handleCloseManageMkDialog} mataKuliah={manageMk.data} onActionSuccess={showNotification} socket={socket} />
            <Dialog open={deleteConfirm.open} onClose={closeDeleteConfirm} fullWidth maxWidth="xs">
                <DialogTitle>Konfirmasi Hapus</DialogTitle>
                <DialogContent>
                    <Typography>
                        {deleteConfirm.type === 'user' && `Anda yakin ingin menghapus akun ${deleteConfirm.data?.nama}?`}
                        {deleteConfirm.type === 'mk' && `Anda yakin ingin menghapus mata kuliah ${deleteConfirm.data?.nama}?`}
                        {deleteConfirm.type === 'multiple-users' && `Anda yakin ingin menghapus ${deleteConfirm.data?.length} pengguna terpilih?`}
                        <br/>
                        Tindakan ini tidak bisa dibatalkan dan akan menghapus semua data terkait.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDeleteConfirm}>Batal</Button>
                    <Button onClick={handleDelete} variant="contained" color="error">Ya, Hapus</Button>
                </DialogActions>
            </Dialog>
            <Snackbar open={notification.open} autoHideDuration={5000} onClose={() => setNotification({ ...notification, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}><Alert onClose={() => setNotification({ ...notification, open: false })} severity={notification.severity} variant="filled" sx={{ width: '100%' }}>{notification.message}</Alert></Snackbar>
        </Container>
    );
};

export default AdminDashboard;