import React, { useState, useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
    Container, Typography, Box, Accordion, AccordionSummary, AccordionDetails, 
    Avatar, Stack, Divider, Chip, Card, CardContent, Paper, Fade, Zoom,
    useTheme, useMediaQuery, IconButton, Tooltip
} from '@mui/material';
import { 
    ExpandMore as ExpandMoreIcon, 
    HelpOutline as HelpOutlineIcon,
    Person as PersonIcon,
    School as SchoolIcon,
    AdminPanelSettings as AdminPanelSettingsIcon,
    Palette as PaletteIcon,
    LockReset as LockResetIcon,
    Search as SearchIcon,
    FileUpload as FileUploadIcon,
    Grading as GradingIcon,
    Event as EventIcon,
    PersonAdd as PersonAddIcon,
    PersonRemove as PersonRemoveIcon,
    Edit as EditIcon,
    BugReport as BugReportIcon,
    Notifications as NotificationsIcon,
    Delete as DeleteIcon,
    QuestionAnswer as QuestionAnswerIcon,
    Star as StarIcon
} from '@mui/icons-material';

const allFaqData = [
    {
        role: 'Umum',
        icon: <HelpOutlineIcon />,
        color: 'info',
        title: 'Pengaturan Dasar & Akun',
        items: [
            {
                q: 'Bagaimana cara mengubah tampilan (mode gelap/terang & warna)?',
                icon: <PaletteIcon />,
                a: 'Sangat mudah! Di halaman Dashboard Anda, cari ikon roda gigi (Pengaturan) di pojok kanan atas. Di sana Anda bisa memilih:\n1. **Mode Warna**: Ganti antara tema Terang dan Gelap.\n2. **Preset Warna**: Pilih skema warna favorit Anda (misalnya Oranye, Biru, atau Hijau).\n3. **Bentuk Sudut**: Sesuaikan tingkat kelengkungan sudut pada tombol dan kartu.\n4. **Jenis Huruf**: Pilih font yang paling nyaman untuk Anda baca.'
            },
            {
                q: 'Saya lupa password. Bagaimana cara meresetnya?',
                icon: <LockResetIcon />,
                a: 'Saat ini, fitur reset password otomatis belum tersedia. Silakan hubungi Administrator sistem Anda untuk bantuan mereset password akun Anda secara manual.'
            },
            {
                q: 'Bisakah saya mengubah email akun saya?',
                icon: <EditIcon />,
                a: 'Saat ini, email yang telah terdaftar tidak dapat diubah untuk menjaga integritas data dan keamanan akun. Jika Anda melakukan kesalahan saat registrasi, silakan hubungi Administrator untuk bantuan.'
            }
        ]
    },
    {
        role: 'Mahasiswa',
        icon: <PersonIcon />,
        color: 'secondary',
        title: 'Panduan untuk Mahasiswa',
        items: [
            {
                q: 'Bagaimana cara bergabung ke sebuah mata kuliah?',
                icon: <SearchIcon />,
                a: 'Untuk bergabung, ikuti langkah berikut:\n1. Dari Dashboard Anda, klik tombol "Cari Mata Kuliah".\n2. Sebuah jendela akan muncul menampilkan semua mata kuliah yang tersedia.\n3. Gunakan kolom pencarian untuk menemukan mata kuliah berdasarkan nama atau kodenya.\n4. Klik tombol "Daftar" di samping mata kuliah yang Anda inginkan.'
            },
            {
                q: 'Bagaimana cara mengumpulkan atau memperbarui file tugas?',
                icon: <FileUploadIcon />,
                a: 'Prosesnya sederhana:\n1. Masuk ke halaman **Detail Mata Kuliah**.\n2. Pilih tab **Tugas** dan klik tugas yang ingin Anda kerjakan.\n3. Di halaman detail tugas, akan ada panel di sisi kanan. Klik "Pilih File" untuk mengunggah jawaban Anda.\n4. Jika Anda salah unggah, Anda dapat mengunggah ulang file baru dengan mengklik **"Unggah Ulang"** selama belum melewati tenggat waktu.'
            },
             {
                q: 'Di mana saya bisa melihat nilai dan feedback?',
                icon: <GradingIcon />,
                a: 'Anda bisa melihat nilai di beberapa tempat:\n- **Untuk Tugas**: Buka kembali halaman detail tugas setelah dinilai. Panel upload akan digantikan oleh panel "Hasil Penilaian" yang berisi nilai dan feedback dari dosen.\n- **Untuk Kuis**: Di halaman detail mata kuliah, tombol "Kerjakan" pada kuis akan berubah menjadi "Lihat Hasil". Klik tombol tersebut untuk melihat rincian skor dan feedback dari AI.'
            },
            {
                q: 'Apa artinya status tugas "Dijadwalkan", "Aktif", atau "Selesai"?',
                icon: <EventIcon />,
                a: 'Status ini membantu Anda melacak progres:\n- **Dijadwalkan**: Tugas atau kuis ini telah dibuat oleh dosen tetapi belum mencapai waktu untuk bisa diakses atau dikerjakan.\n- **Aktif**: Tugas atau kuis ini sudah dibuka dan sedang dalam periode pengerjaan.\n- **Selesai**: Tenggat waktu untuk tugas atau kuis ini telah berakhir.'
            }
        ]
    },
    {
        role: 'Dosen',
        icon: <SchoolIcon />,
        color: 'primary',
        title: 'Panduan untuk Dosen',
        items: [
            {
                q: 'Bagaimana cara menambahkan mahasiswa ke mata kuliah saya?',
                icon: <PersonAddIcon />,
                a: 'Sistem ini menggunakan model pendaftaran mandiri (self-enrollment). Mahasiswa harus secara aktif mendaftar ke mata kuliah Anda. Anda bisa membagikan **Kode Mata Kuliah** kepada mahasiswa agar mereka lebih mudah menemukannya di halaman pencarian.'
            },
            {
                q: 'Bagaimana cara mengedit tenggat waktu tugas yang sudah dibuat?',
                icon: <EditIcon />,
                a: 'Anda bisa mengubah tenggat waktu dengan fleksibel:\n1. Masuk ke halaman **Detail Tugas** yang ingin diubah.\n2. Di bagian header halaman (kartu berwarna), klik ikon **Edit Kalender** di pojok kanan atas.\n3. Pilih tanggal dan waktu baru, lalu simpan. Perubahan ini akan langsung terlihat oleh mahasiswa.'
            },
            {
                q: 'Di mana saya bisa melihat rekapitulasi nilai mahasiswa?',
                icon: <GradingIcon />,
                a: 'Setiap aktivitas memiliki rekapitulasi nilainya sendiri:\n- **Untuk Tugas**: Buka halaman **Detail Tugas**. Halaman ini akan menampilkan daftar semua mahasiswa yang telah mengumpulkan, beserta status dan nilainya.\n- **Untuk Kuis**: Buka halaman **Detail Kuis**. Halaman ini menampilkan daftar mahasiswa yang telah mengerjakan beserta skor yang dihitung otomatis oleh AI.'
            },
            {
                q: 'Bagaimana cara menghapus tugas, kuis, atau mengeluarkan mahasiswa?',
                icon: <DeleteIcon />,
                a: 'Semua aksi manajemen dilakukan di halaman **Detail Mata Kuliah**:\n1. Pilih tab yang sesuai (Tugas, Kuis, atau Mahasiswa).\n2. Di samping setiap item, Anda akan menemukan **ikon tong sampah**.\n3. Klik ikon tersebut dan konfirmasikan tindakan Anda. Perlu diingat bahwa tindakan ini bersifat permanen dan akan menghapus semua data terkait.'
            }
        ]
    },
    {
        role: 'Penyelesaian Masalah',
        icon: <BugReportIcon />,
        color: 'warning',
        title: 'Penyelesaian Masalah Umum',
        items: [
            {
                q: 'Saya mendapat error saat mengerjakan kuis, apa yang harus dilakukan?',
                icon: <BugReportIcon />,
                a: 'Error saat pengerjaan kuis, terutama yang melibatkan AI, bisa terjadi karena beberapa hal, seperti koneksi internet yang tidak stabil atau masalah sementara pada layanan AI. Coba lakukan refresh halaman. Jika masalah berlanjut, hubungi Dosen atau Administrator Anda.'
            },
            {
                q: 'Mengapa saya tidak melihat notifikasi real-time?',
                icon: <NotificationsIcon />,
                a: 'Fitur notifikasi real-time memerlukan koneksi internet yang stabil dan aktif ke server kami. Pastikan Anda tidak menggunakan firewall atau VPN yang mungkin memblokir koneksi WebSocket. Jika Anda merasa ada masalah, me-refresh halaman biasanya dapat menyambungkan ulang koneksi.'
            }
        ]
    }
];

const HelpPage = () => {
    const { user } = useContext(AuthContext);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
    const [expanded, setExpanded] = useState('panel-Umum-0');

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    const filteredFaqData = useMemo(() => {
        const isTroubleshooting = (section) => section.role === 'Penyelesaian Masalah';
        if (!user) {
            return allFaqData.filter(section => section.role === 'Umum' || isTroubleshooting(section));
        }
        return allFaqData.filter(section => 
            section.role === 'Umum' || 
            section.role.toLowerCase() === user.role ||
            isTroubleshooting(section)
        );
    }, [user]);

    const formatAnswerText = (text) => {
        return text.split('\n').map((line, index) => {
            if (line.startsWith('**') && line.endsWith('**')) {
                const boldText = line.slice(2, -2);
                return (
                    <Typography key={index} component="div" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 0.5 }}>
                        {boldText}
                    </Typography>
                );
            } else if (line.includes('**')) {
                const parts = line.split('**');
                return (
                    <Typography key={index} component="div" sx={{ mb: 0.5 }}>
                        {parts.map((part, partIndex) => 
                            partIndex % 2 === 1 ? (
                                <Box component="span" key={partIndex} sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                    {part}
                                </Box>
                            ) : part
                        )}
                    </Typography>
                );
            }
            return line ? (
                <Typography key={index} component="div" sx={{ mb: 0.5 }}>
                    {line}
                </Typography>
            ) : (
                <Box key={index} sx={{ height: 8 }} />
            );
        });
    };

    return (
        <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
            {/* Header Section */}
            <Fade in timeout={800}>
                <Paper 
                    elevation={0} 
                    sx={{ 
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.secondary.main}10)`,
                        borderRadius: 3,
                        p: { xs: 3, md: 4 },
                        mb: 4,
                        border: `1px solid ${theme.palette.divider}`,
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <Box sx={{ 
                        position: 'absolute', 
                        top: -20, 
                        right: -20, 
                        opacity: 0.1,
                        transform: 'rotate(12deg)'
                    }}>
                        <QuestionAnswerIcon sx={{ fontSize: 120 }} />
                    </Box>
                    
                    <Stack 
                        direction={{ xs: 'column', sm: 'row' }} 
                        spacing={{ xs: 2, sm: 3 }} 
                        alignItems={{ xs: 'center', sm: 'flex-start' }}
                        sx={{ position: 'relative', zIndex: 1 }}
                    >
                        <Zoom in timeout={1000}>
                            <Avatar 
                                sx={{ 
                                    bgcolor: 'primary.main',
                                    width: { xs: 64, md: 72 }, 
                                    height: { xs: 64, md: 72 },
                                    boxShadow: theme.shadows[8]
                                }}
                            >
                                <HelpOutlineIcon sx={{ fontSize: { xs: 32, md: 36 } }} />
                            </Avatar>
                        </Zoom>
                        
                        <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                            <Typography 
                                variant={isSmall ? "h5" : "h4"} 
                                fontWeight="bold" 
                                color="primary.main"
                                sx={{ mb: 1 }}
                            >
                                Pusat Bantuan
                            </Typography>
                            <Typography 
                                variant="body1" 
                                color="text.secondary"
                                sx={{ maxWidth: 500 }}
                            >
                                {user 
                                    ? `Halo ${user.nama}! Temukan jawaban cepat untuk pertanyaan Anda di sini.` 
                                    : 'Temukan jawaban untuk pertanyaan yang sering diajukan dengan mudah dan cepat.'
                                }
                            </Typography>
                            
                            {user && (
                                <Chip
                                    icon={<StarIcon />}
                                    label={`${user.role.charAt(0).toUpperCase() + user.role.slice(1)} Mode`}
                                    size="small"
                                    sx={{ 
                                        mt: 2, 
                                        bgcolor: 'primary.main', 
                                        color: 'white',
                                        fontWeight: 'medium'
                                    }}
                                />
                            )}
                        </Box>
                    </Stack>
                </Paper>
            </Fade>

            {/* FAQ Sections */}
            <Stack spacing={3}>
                {filteredFaqData.map((section, sectionIndex) => (
                    <Fade in timeout={800 + (sectionIndex * 200)} key={section.role}>
                        <Card 
                            elevation={0}
                            sx={{ 
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: 2,
                                overflow: 'hidden',
                                '&:hover': {
                                    boxShadow: theme.shadows[4],
                                    transform: 'translateY(-2px)',
                                    transition: 'all 0.3s ease-in-out'
                                }
                            }}
                        >
                            {/* Section Header */}
                            <Box
                                sx={{
                                    background: `linear-gradient(45deg, ${theme.palette[section.color].main}20, ${theme.palette[section.color].main}10)`,
                                    p: { xs: 2, md: 3 },
                                    borderBottom: `1px solid ${theme.palette.divider}`
                                }}
                            >
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <Avatar
                                        sx={{
                                            bgcolor: `${section.color}.main`,
                                            width: { xs: 40, md: 48 },
                                            height: { xs: 40, md: 48 },
                                            boxShadow: theme.shadows[4]
                                        }}
                                    >
                                        {React.cloneElement(section.icon, { 
                                            sx: { fontSize: { xs: 20, md: 24 }, color: 'white' } 
                                        })}
                                    </Avatar>
                                    
                                    <Box sx={{ flex: 1 }}>
                                        <Typography 
                                            variant={isSmall ? "h6" : "h5"} 
                                            fontWeight="bold"
                                            color={`${section.color}.main`}
                                        >
                                            {section.title}
                                        </Typography>
                                        <Typography 
                                            variant="body2" 
                                            color="text.secondary"
                                            sx={{ mt: 0.5 }}
                                        >
                                            {section.items.length} pertanyaan tersedia
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Box>

                            {/* FAQ Items */}
                            <CardContent sx={{ p: 0 }}>
                                {section.items.map((faq, faqIndex) => (
                                    <Accordion
                                        key={faq.q}
                                        expanded={expanded === `panel-${section.role}-${faqIndex}`}
                                        onChange={handleChange(`panel-${section.role}-${faqIndex}`)}
                                        sx={{
                                            '&:before': { display: 'none' },
                                            '&.Mui-expanded': {
                                                margin: 0,
                                                '&:before': { display: 'none' }
                                            },
                                            boxShadow: 'none',
                                            border: 'none',
                                            borderBottom: faqIndex < section.items.length - 1 ? `1px solid ${theme.palette.divider}` : 'none'
                                        }}
                                    >
                                        <AccordionSummary 
                                            expandIcon={<ExpandMoreIcon />}
                                            sx={{
                                                px: { xs: 2, md: 3 },
                                                py: 2,
                                                '&:hover': {
                                                    bgcolor: 'action.hover'
                                                },
                                                '& .MuiAccordionSummary-content': {
                                                    my: 1
                                                }
                                            }}
                                        >
                                            <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                                                {faq.icon && (
                                                    <Avatar
                                                        sx={{
                                                            bgcolor: `${section.color}.lighter`,
                                                            width: 32,
                                                            height: 32,
                                                            '& svg': { fontSize: 18 }
                                                        }}
                                                    >
                                                        {React.cloneElement(faq.icon, { 
                                                            color: section.color === 'warning' ? 'warning' : 'action'
                                                        })}
                                                    </Avatar>
                                                )}
                                                <Typography 
                                                    fontWeight="medium"
                                                    sx={{ 
                                                        fontSize: { xs: '0.95rem', md: '1rem' },
                                                        lineHeight: 1.4,
                                                        flex: 1
                                                    }}
                                                >
                                                    {faq.q}
                                                </Typography>
                                            </Stack>
                                        </AccordionSummary>
                                        
                                        <AccordionDetails 
                                            sx={{ 
                                                px: { xs: 2, md: 3 },
                                                py: { xs: 2, md: 3 },
                                                bgcolor: 'background.default',
                                                borderTop: `1px solid ${theme.palette.divider}`
                                            }}
                                        >
                                            <Box sx={{ 
                                                pl: faq.icon ? { xs: 5, md: 6 } : 0,
                                                color: 'text.secondary',
                                                lineHeight: 1.6,
                                                '& > div': { fontSize: { xs: '0.9rem', md: '0.95rem' } }
                                            }}>
                                                {formatAnswerText(faq.a)}
                                            </Box>
                                        </AccordionDetails>
                                    </Accordion>
                                ))}
                            </CardContent>
                        </Card>
                    </Fade>
                ))}
            </Stack>

            {/* Footer Message */}
            <Fade in timeout={1200}>
                <Paper
                    elevation={0}
                    sx={{
                        mt: 4,
                        p: 3,
                        textAlign: 'center',
                        bgcolor: 'background.default',
                        border: `1px dashed ${theme.palette.divider}`,
                        borderRadius: 2
                    }}
                >
                    <Typography variant="body2" color="text.secondary">
                        Tidak menemukan jawaban yang Anda cari? Silakan hubungi Administrator atau Dosen Anda untuk bantuan lebih lanjut.
                    </Typography>
                </Paper>
            </Fade>
        </Container>
    );
};

export default HelpPage;