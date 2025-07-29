import React, { useState, useEffect, useContext } from 'react'; // <-- PERBAIKAN DI SINI
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import {
    Container, Typography, Box, Paper, CircularProgress, Alert,
    Button, Divider, Card, CardContent, Chip, Stack, Avatar, Grid
} from '@mui/material';
import { 
    Quiz as QuizIcon, ArrowBack as ArrowBackIcon, CheckCircle as CheckCircleIcon, 
    Cancel as CancelIcon, Info as InfoIcon, Star as StarIcon, HelpOutline as HelpOutlineIcon,
    Lightbulb as LightbulbIcon
} from '@mui/icons-material';

// --- Komponen Internal ---

const PageHeader = ({ kuis, submission }) => {
    const getScoreColor = (score) => {
        if (score >= 85) return 'success';
        if (score >= 70) return 'info';
        if (score >= 60) return 'warning';
        return 'error';
    };

    return (
        <Card sx={{ mb: 4, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: 'background.paper', color: 'primary.main', width: 56, height: 56 }}><QuizIcon /></Avatar>
                        <Box>
                            <Typography variant="h4" fontWeight="bold">{kuis?.judul}</Typography>
                            <Typography variant="body1" sx={{ opacity: 0.9 }}>Tinjauan Hasil Kuis</Typography>
                        </Box>
                    </Stack>
                    <Paper elevation={3} sx={{ p: 2, textAlign: 'center', minWidth: 140 }}>
                        <Typography variant="caption" color="text.secondary" display="block">Skor Akhir</Typography>
                        <Typography variant="h3" fontWeight="bold" color={`${getScoreColor(submission?.skor)}.main`}>
                            {submission?.skor ?? 'N/A'}
                        </Typography>
                    </Paper>
                </Stack>
            </CardContent>
        </Card>
    );
};

const QuestionReviewItem = ({ question, submission, index }) => {
    const studentAnswer = submission?.jawaban.find(j => j.pertanyaanId.toString() === question._id.toString());
    
    let statusIcon, statusColor, statusText;

    if (studentAnswer) {
        if (studentAnswer.isBenar === true) {
            statusIcon = <CheckCircleIcon />;
            statusColor = 'success';
            statusText = 'Benar';
        } else if (studentAnswer.isBenar === false) {
            statusIcon = <CancelIcon />;
            statusColor = 'error';
            statusText = 'Kurang Tepat';
        } else if (studentAnswer.isBenar === null) {
            statusIcon = <InfoIcon />;
            statusColor = 'info';
            statusText = 'Jawaban Essay';
        } else {
            statusIcon = <CheckCircleIcon />;
            statusColor = 'info';
            statusText = 'Telah Dinilai';
        }
    } else {
        statusIcon = <HelpOutlineIcon />;
        statusColor = 'warning';
        statusText = 'Tidak Dijawab';
    }

    return (
        <Paper variant="outlined" sx={{ mb: 3 }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="medium">{`Pertanyaan ${index + 1}`}</Typography>
                <Chip icon={statusIcon} label={statusText} color={statusColor} size="small" />
            </Box>
            <CardContent>
                <Typography variant="body1" sx={{ mb: 2 }}>{question.soal}</Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                    <Grid item xs={12} md={studentAnswer?.isBenar === false ? 6 : 12}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Jawaban Anda:</Typography>
                        <Paper variant="outlined" sx={{ p: 2, minHeight: 80, bgcolor: 'background.default' }}>
                            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                {studentAnswer?.jawabanTeks || <em>(Tidak ada jawaban)</em>}
                            </Typography>
                        </Paper>
                    </Grid>
                    {studentAnswer?.isBenar === false && (
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Jawaban yang Benar:</Typography>
                            <Paper variant="outlined" sx={{ p: 2, minHeight: 80, bgcolor: 'success.lighter', borderColor: 'success.main' }}>
                                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', color: 'success.dark' }}>
                                    {question.kunciJawaban}
                                </Typography>
                            </Paper>
                        </Grid>
                    )}
                </Grid>
                
                {studentAnswer?.aiFeedback && (
                    <Alert severity="info" icon={<LightbulbIcon />} sx={{ mt: 2 }}>
                        <strong>Feedback:</strong> {studentAnswer.aiFeedback}
                    </Alert>
                )}
            </CardContent>
        </Paper>
    );
};

const KuisDetailMahasiswa = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext); // <-- PERBAIKAN
    const navigate = useNavigate();
    const [kuis, setKuis] = useState(null); // <-- PERBAIKAN
    const [submission, setSubmission] = useState(null); // <-- PERBAIKAN
    const [loading, setLoading] = useState(true); // <-- PERBAIKAN
    const [error, setError] = useState(''); // <-- PERBAIKAN

    useEffect(() => { // <-- PERBAIKAN
        if (!user) return;
        
        const fetchHasil = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/kuis/${id}/hasil`);
                setKuis(res.data.kuis);
                setSubmission(res.data.submission);
            } catch (err) {
                setError(err.response?.data?.message || "Gagal memuat hasil kuis.");
            } finally {
                setLoading(false);
            }
        };

        fetchHasil();
    }, [id, user]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }
    
    if (error) {
        return (
            <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
                    Kembali
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
                Kembali
            </Button>
            
            <PageHeader kuis={kuis} submission={submission} />

            {kuis?.pertanyaan.map((question, index) => (
                <QuestionReviewItem 
                    key={question._id}
                    question={question}
                    submission={submission}
                    index={index}
                />
            ))}
        </Container>
    );
};

export default KuisDetailMahasiswa;