import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
    Container, Typography, Box, Button, Paper, CircularProgress, Alert,
    FormControl, RadioGroup, FormControlLabel, Radio, TextField, LinearProgress,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Divider
} from '@mui/material';

const KuisPage = () => {
    const { id: kuisId } = useParams();
    const navigate = useNavigate();
    const [kuis, setKuis] = useState(null);
    const [submission, setSubmission] = useState(null); // <<< State untuk seluruh objek submission
    const [jawaban, setJawaban] = useState([]);
    const [timeLeft, setTimeLeft] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [confirmOpen, setConfirmOpen] = useState(false);
    
    const visibilityListenerAttached = useRef(false);

    // Fungsi submit sekarang menggunakan ID dari state submission
    const handleSubmit = useCallback(async () => {
        if (!submission) return;
        setConfirmOpen(false);
        try {
            const res = await api.put(`/kuis/submit/${submission._id}`, { jawaban });
            alert(`Kuis Selesai! Skor Anda: ${res.data.skor}`);
            
            // --- PERBAIKAN DI SINI ---
            // Pastikan kita menggunakan string ID dari mataKuliahId, bukan seluruh objek.
            navigate(`/mahasiswa/matakuliah/${kuis.mataKuliahId._id}`); 
            // ========================

        } catch (err) {
            setError(err.response?.data?.message || 'Gagal mengirimkan kuis.');
        }
    }, [submission, jawaban, navigate, kuis]);

    // Efek untuk memulai atau melanjutkan kuis
    useEffect(() => {
        const startAndFetchKuis = async () => {
            try {
                // Endpoint ini sekarang bisa mengembalikan submission yang sudah ada atau membuat yang baru
                const subRes = await api.post(`/kuis/${kuisId}/start`);
                setSubmission(subRes.data);

                const kuisRes = await api.get(`/kuis/${kuisId}`);
                setKuis(kuisRes.data);
                setTimeLeft(kuisRes.data.waktuPengerjaan * 60);

                // Inisialisasi jawaban. Jika melanjutkan, isi dengan jawaban yang sudah ada.
                const initialJawaban = kuisRes.data.pertanyaan.map(p => {
                    const savedAnswer = subRes.data.jawaban?.find(j => j.pertanyaanId === p._id);
                    return { pertanyaanId: p._id, jawabanTeks: savedAnswer?.jawabanTeks || '' };
                });
                setJawaban(initialJawaban);
                
            } catch (err) {
                setError(err.response?.data?.message || 'Gagal memulai kuis.');
            } finally {
                setLoading(false);
            }
        };
        startAndFetchKuis();
    }, [kuisId]);
    
    // Efek untuk deteksi pindah tab
    useEffect(() => {
        if (!submission || visibilityListenerAttached.current) return;
        
        const handleVisibilityChange = () => {
            if (document.hidden) {
                api.post(`/kuis/log-kecurangan/${submission._id}`).catch(err => console.error("Gagal log:", err));
            }
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        visibilityListenerAttached.current = true;

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            visibilityListenerAttached.current = false;
        };
    }, [submission]);

    // Efek untuk timer
    useEffect(() => {
        if (timeLeft <= 0 && kuis && submission) { 
            handleSubmit(); 
            return; 
        }
        if (!kuis || timeLeft < 0) return;
        const intervalId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(intervalId);
    }, [timeLeft, kuis, submission, handleSubmit]);
    
    const handleAnswerChange = (pertanyaanId, jawabanTeks) => {
        setJawaban(prev => prev.map(j => j.pertanyaanId === pertanyaanId ? { ...j, jawabanTeks } : j));
    };
    
    const formatTime = (seconds) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    const progress = kuis ? ((kuis.waktuPengerjaan * 60 - timeLeft) / (kuis.waktuPengerjaan * 60)) * 100 : 0;

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;
    if (error) return (
        <Container sx={{ textAlign: 'center', py: 4 }}>
            <Alert severity="error">{error}</Alert>
            <Button onClick={() => navigate(-1)} sx={{mt: 2}}>Kembali</Button>
        </Container>
    );
    if (!kuis) return null;

    return (
        <Box onCopy={(e) => e.preventDefault()} onPaste={(e) => e.preventDefault()}>
            <Container maxWidth="md">
                <Paper sx={{ my: 4, p: 4 }}>
                    <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h4">{kuis.judul}</Typography>
                            <Typography variant="h5" color={timeLeft < 60 ? 'error.main' : 'primary.main'} fontWeight="bold">
                                {formatTime(timeLeft)}
                            </Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={progress} sx={{ my: 2 }} />
                    </Box>
                    <Divider sx={{ mb: 3 }} />
                    <Box component="form" onSubmit={(e) => { e.preventDefault(); setConfirmOpen(true); }}>
                        {kuis.pertanyaan.map((p, index) => (
                            <Paper key={p._id} variant="outlined" sx={{ p: 3, mb: 3 }}>
                                <Typography variant="h6" gutterBottom>{`${index + 1}. ${p.soal}`}</Typography>
                                {p.tipe === 'pilihanGanda' ? (
                                    <FormControl component="fieldset" sx={{ mt: 1 }}>
                                        <RadioGroup value={jawaban.find(j => j.pertanyaanId === p._id)?.jawabanTeks || ''} onChange={(e) => handleAnswerChange(p._id, e.target.value)}>
                                            {p.pilihan.map((pil, pIndex) => (
                                                <FormControlLabel key={pIndex} value={pil} control={<Radio />} label={pil} />
                                            ))}
                                        </RadioGroup>
                                    </FormControl>
                                ) : (
                                    <TextField fullWidth multiline rows={4} variant="outlined" label="Ketik Jawaban Anda" value={jawaban.find(j => j.pertanyaanId === p._id)?.jawabanTeks || ''} onChange={(e) => handleAnswerChange(p._id, e.target.value)} />
                                )}
                            </Paper>
                        ))}
                        <Button type="submit" variant="contained" size="large" fullWidth sx={{ py: 1.5, mt: 2 }}>Selesaikan Kuis</Button>
                    </Box>
                </Paper>
                <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                    <DialogTitle>Konfirmasi Selesaikan Kuis</DialogTitle>
                    <DialogContent><DialogContentText>Apakah Anda yakin ingin menyelesaikan dan mengirim kuis ini?</DialogContentText></DialogContent>
                    <DialogActions>
                        <Button onClick={() => setConfirmOpen(false)}>Batal</Button>
                        <Button onClick={handleSubmit} variant="contained" color="primary">Ya, Selesaikan</Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
};

export default KuisPage;