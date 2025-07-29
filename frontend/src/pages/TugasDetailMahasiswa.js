import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import {
    Container, Typography, Box, Paper, CircularProgress, Alert,
    Button, Divider, Card, CardContent, Chip, Stack, Grid,
    LinearProgress, Link, Avatar
} from '@mui/material';
import {
    CloudUpload as CloudUploadIcon, Assignment as AssignmentIcon, Schedule as ScheduleIcon,
    CheckCircle as CheckCircleIcon, ArrowBack as ArrowBackIcon,
    AttachFile as AttachFileIcon, Edit as EditIcon, Star as StarIcon, Feedback as FeedbackIcon,
    Visibility as VisibilityIcon
} from '@mui/icons-material';

const SubmissionPanel = ({ tugas, submission, onFileChange, selectedFile, onSubmit, submitting }) => {
    const isOverdue = new Date(tugas.tenggat) < new Date();
    const isSubmitted = !!submission;

    return (
        <Card sx={{ position: 'sticky', top: 20 }}>
            <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
                    {isSubmitted ? 'Tugas Terkumpul' : 'Kumpulkan Tugas'}
                </Typography>
                
                {isSubmitted && !isOverdue && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Anda dapat mengunggah ulang file jawaban sebelum tenggat waktu berakhir.
                    </Alert>
                )}

                {isSubmitted && (
                    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">File Terkumpul:</Typography>
                        <Link href={`http://localhost:5000${submission.fileUrl}`} target="_blank" rel="noopener noreferrer" sx={{ display: 'flex', alignItems: 'center', gap: 1, wordBreak: 'break-all' }}>
                            <AttachFileIcon fontSize="small" />
                            <Typography fontWeight="medium">{submission.fileUrl.split('/').pop()}</Typography>
                        </Link>
                        <Typography variant="caption" color="text.secondary">
                            Dikumpulkan pada: {new Date(submission.createdAt || submission.tanggalPengumpulan).toLocaleString('id-ID')}
                        </Typography>
                    </Paper>
                )}
                
                {!isOverdue && (
                    <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', borderStyle: 'dashed', bgcolor: 'background.default' }}>
                        <Button component="label" startIcon={<CloudUploadIcon />} sx={{ mb: 1 }}>
                            {selectedFile ? 'Ganti File' : 'Pilih File'}
                            <input type="file" hidden onChange={onFileChange} accept=".pdf,.doc,.docx,.zip,.rar,.jpg,.png" />
                        </Button>
                        {selectedFile ? (
                            <Typography variant="body2" color="primary.main" sx={{ wordBreak: 'break-all' }}>{selectedFile.name}</Typography>
                        ) : (
                            <Typography variant="caption" color="text.secondary">Pilih file untuk diunggah</Typography>
                        )}
                    </Paper>
                )}

                <Box sx={{ mt: 2 }}>
                    <Button
                        variant="contained"
                        onClick={onSubmit}
                        disabled={!selectedFile || submitting || isOverdue}
                        fullWidth
                        size="large"
                        startIcon={isSubmitted ? <EditIcon /> : <CloudUploadIcon />}
                    >
                        {submitting ? 'Mengunggah...' : (isSubmitted ? 'Unggah Ulang' : 'Kirim Tugas')}
                    </Button>
                    {submitting && <LinearProgress sx={{ mt: 1 }} />}
                </Box>

                {isOverdue && !isSubmitted && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        Batas waktu pengumpulan telah berakhir.
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
};

const HasilPenilaianPanel = ({ submission }) => {
    const getScoreColor = (score) => {
        if (score >= 85) return 'success';
        if (score >= 70) return 'info';
        if (score >= 60) return 'warning';
        return 'error';
    };

    return (
        <Card sx={{ position: 'sticky', top: 20 }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Chip
                    label="Tugas Telah Dinilai"
                    color="success"
                    icon={<CheckCircleIcon />}
                    sx={{ mb: 2 }}
                />
                <Typography variant="body2" color="text.secondary">Nilai Anda</Typography>
                <Typography variant="h2" fontWeight="bold" color={`${getScoreColor(submission.nilai)}.main`}>
                    {submission.nilai}
                </Typography>
                <Divider sx={{ my: 2 }} />

                <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FeedbackIcon color="primary" />
                        Feedback dari Dosen
                    </Typography>
                    {submission.feedback ? (
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                            <Typography sx={{ whiteSpace: 'pre-wrap' }}>{submission.feedback}</Typography>
                        </Paper>
                    ) : (
                        <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            Tidak ada feedback yang diberikan.
                        </Typography>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};

const TugasDetailMahasiswa = ({ socket }) => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [tugas, setTugas] = useState(null);
    const [submission, setSubmission] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchData = useCallback(async () => {
        if (!user || !id) return;
        setLoading(true);
        try {
            const [tugasRes, subRes] = await Promise.all([
                api.get(`/tugas/${id}`),
                api.get(`/mahasiswa/submissions/${user.id}`)
            ]);
            
            if (new Date(tugasRes.data.tanggalBuka) > new Date()) {
                setError("Tugas ini belum dibuka oleh dosen.");
                setTugas(null);
            } else {
                setTugas(tugasRes.data);
                const currentSubmission = subRes.data.find(s => s.tugasId === id);
                setSubmission(currentSubmission || null);
            }
        } catch (err) {
            setError("Gagal memuat data atau tugas tidak ditemukan.");
        } finally {
            setLoading(false);
        }
    }, [id, user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (!socket) return;
        const handleTugasDinilai = (updatedSubmission) => {
            if (updatedSubmission.tugasId === id) {
                setSubmission(updatedSubmission);
            }
        };
        socket.on('tugasDinilai', handleTugasDinilai);
        return () => {
            socket.off('tugasDinilai', handleTugasDinilai);
        };
    }, [socket, id]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!selectedFile) {
            setError("Silakan pilih file untuk diunggah.");
            return;
        }
        setSubmitting(true);
        setError(''); setSuccess('');
        
        const formData = new FormData();
        formData.append('fileTugas', selectedFile);
        
        try {
            const res = await api.post(
                `/tugas/${id}/submit`, 
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            setSuccess(res.data.message);
            setSubmission(res.data.submission);
            setSelectedFile(null);
        } catch (err) {
            setError(err.response?.data?.message || "Terjadi kesalahan saat mengunggah.");
        } finally {
            setSubmitting(false);
        }
    };
    
    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;
    
    if (!tugas && error) {
        return (
            <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
                    Kembali
                </Button>
            </Container>
        );
    }

    if (!tugas) return null;

    const isDinilai = submission && submission.status === 'dinilai';

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
                Kembali ke Mata Kuliah
            </Button>

            <Grid container spacing={4}>
                <Grid item xs={12} md={7}>
                    <Paper sx={{ p: { xs: 2, md: 4 } }}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.main', color: 'white' }}><AssignmentIcon /></Avatar>
                            <Typography variant="h4" fontWeight="bold">{tugas.judul}</Typography>
                        </Stack>
                        <Divider sx={{ my: 2 }} />
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
                            <Chip
                                icon={<ScheduleIcon />}
                                label={`Dibuka: ${new Date(tugas.tanggalBuka).toLocaleString('id-ID')}`}
                                color="info"
                                variant="outlined"
                            />
                            <Chip
                                icon={<ScheduleIcon />}
                                label={`Tenggat: ${new Date(tugas.tenggat).toLocaleString('id-ID')}`}
                                color={new Date(tugas.tenggat) < new Date() ? 'error' : 'default'}
                            />
                        </Stack>
                        <Typography variant="h6" gutterBottom>Deskripsi Tugas</Typography>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, color: 'text.secondary' }}>
                            {tugas.deskripsi}
                        </Typography>
                        
                        {tugas.lampiranUrl && (
                            <Box mt={3}>
                                <Divider sx={{ mb: 2 }} />
                                <Typography variant="h6" gutterBottom>Lampiran</Typography>
                                <Button
                                    component={Link}
                                    href={`http://localhost:5000${tugas.lampiranUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    variant="outlined"
                                    startIcon={<VisibilityIcon />}
                                >
                                    Lihat File Lampiran
                                </Button>
                            </Box>
                        )}
                    </Paper>
                </Grid>

                <Grid item xs={12} md={5}>
                    {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    {isDinilai ? (
                        <HasilPenilaianPanel submission={submission} />
                    ) : (
                        <SubmissionPanel
                            tugas={tugas}
                            submission={submission}
                            onFileChange={handleFileChange}
                            selectedFile={selectedFile}
                            onSubmit={handleSubmit}
                            submitting={submitting}
                        />
                    )}
                </Grid>
            </Grid>
        </Container>
    );
};

export default TugasDetailMahasiswa;