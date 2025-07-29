import React, { useState, useMemo } from 'react';
import {
    Container, Typography, Box, Paper, TextField, InputAdornment,
    Stack, Avatar, Chip, Grow, Divider
} from '@mui/material';
import { 
    MenuBook as MenuBookIcon, 
    Search as SearchIcon 
} from '@mui/icons-material';

// Data untuk Glosarium dengan bahasa yang lebih sederhana dan diurutkan
const glossaryData = [
    {
        term: 'Admin',
        definition: 'Pengguna dengan hak akses tertinggi di platform. Tugasnya mengelola akun Dosen dan Mahasiswa, mirip seperti kepala sekolah di dunia nyata.'
    },
    {
        term: 'API (Application Programming Interface)',
        definition: 'Sebuah "jembatan" atau "pelayan" digital yang menghubungkan aplikasi frontend (yang Anda lihat) dengan backend (otak aplikasi). Saat Anda mengklik tombol, frontend "memesan" data dari backend melalui API.'
    },
    {
        term: 'Async / Await',
        definition: 'Cara modern dalam JavaScript untuk menangani proses yang butuh waktu (seperti mengambil data dari database). `async` menandakan sebuah fungsi bisa "menunggu", dan `await` adalah perintah untuk "menunggu" hingga sebuah proses selesai sebelum melanjutkan.'
    },
    {
        term: 'Autentikasi (Authentication)',
        definition: 'Proses untuk memverifikasi identitas Anda. Ini menjawab pertanyaan "Siapa Anda?". Contohnya adalah saat Anda memasukkan email dan password untuk login.'
    },
    {
        term: 'Otorisasi (Authorization)',
        definition: 'Proses untuk menentukan hak akses Anda setelah identitas terverifikasi. Ini menjawab pertanyaan "Apa yang boleh Anda lakukan?". Contohnya, Dosen diotorisasi untuk membuat tugas, tetapi Mahasiswa tidak.'
    },
    {
        term: 'Backend',
        definition: 'Bagian "dapur" atau "mesin" dari sebuah aplikasi. Ia berjalan di server untuk mengelola data, logika, dan keamanan. Anda tidak melihatnya, tetapi ia membuat semuanya bekerja.'
    },
    {
        term: 'Component (React)',
        definition: 'Sebuah "balok LEGO" untuk membangun antarmuka. Setiap bagian dari halaman (seperti tombol, kartu, atau bahkan seluruh dashboard) adalah sebuah komponen yang bisa digunakan kembali.'
    },
    {
        term: 'CORS (Cross-Origin Resource Sharing)',
        definition: 'Sebuah mekanisme keamanan di browser. Anggap saja backend adalah sebuah gedung eksklusif. Secara default, ia hanya mengizinkan permintaan dari "origin" (alamat web) yang sama. CORS adalah "izin masuk" yang diberikan backend agar frontend dari alamat lain (seperti Vercel) bisa mengakses datanya.'
    },
    {
        term: 'CRUD',
        definition: 'Singkatan dari Create, Read, Update, Delete. Ini adalah empat operasi dasar yang bisa dilakukan pada data di database. Contoh: Membuat (Create) akun, Membaca (Read) daftar tugas, Memperbarui (Update) profil, Menghapus (Delete) mata kuliah.'
    },
    {
        term: 'Database',
        definition: 'Sebuah "lemari arsip" digital tempat semua data aplikasi (info pengguna, tugas, nilai) disimpan dengan rapi dan terstruktur.'
    },
    {
        term: 'Deployment',
        definition: 'Proses "menerbitkan" aplikasi dari komputer lokal ke internet agar bisa diakses oleh semua orang. Frontend di-deploy ke Vercel, dan backend di-deploy ke Render.'
    },
    {
        term: 'Dosen',
        definition: 'Pengguna dengan peran sebagai pengajar. Dosen dapat membuat mata kuliah, menambahkan tugas dan kuis, serta memberikan nilai kepada mahasiswa.'
    },
    {
        term: 'Enroll (Mendaftar)',
        definition: 'Proses di mana seorang mahasiswa bergabung atau mendaftarkan diri ke sebuah mata kuliah untuk dapat mengakses materi, tugas, dan kuis di dalamnya.'
    },
    {
        term: 'Express.js',
        definition: 'Sebuah kerangka kerja (framework) untuk Node.js yang bertindak seperti "manajer lalu lintas" untuk backend. Ia mengatur rute-rute API dan menentukan apa yang harus dilakukan untuk setiap permintaan yang masuk.'
    },
    {
        term: 'Frontend',
        definition: 'Tampilan visual dari sebuah aplikasi yang Anda lihat dan gunakan di browser. Ini seperti "ruang pamer" atau "etalase toko" yang dirancang agar mudah dan nyaman digunakan.'
    },
    {
        term: 'Hashing',
        definition: 'Proses mengubah data (seperti password) menjadi serangkaian karakter acak yang tidak bisa dibalikkan. Bayangkan seperti memasukkan buah ke dalam blender; Anda bisa membuat jus dari buah, tapi tidak bisa mengembalikan jus menjadi buah utuh. Ini membuat password aman.'
    },
    {
        term: 'JWT (JSON Web Token)',
        definition: 'Sebuah "tiket masuk" digital yang aman. Setelah Anda login, server memberikan JWT ini. Setiap kali Anda ingin mengakses halaman terproteksi, Anda cukup menunjukkan tiket ini tanpa perlu login ulang.'
    },
    {
        term: 'Mahasiswa',
        definition: 'Pengguna dengan peran sebagai pelajar. Mahasiswa dapat mendaftar ke mata kuliah, mengerjakan tugas dan kuis, serta melihat nilai yang diberikan oleh dosen.'
    },
    {
        term: 'Mata Kuliah',
        definition: 'Sebuah "kelas virtual" yang dibuat oleh dosen. Di dalamnya terdapat semua materi, tugas, kuis, dan daftar mahasiswa yang terdaftar untuk subjek tertentu.'
    },
    {
        term: 'MongoDB',
        definition: 'Jenis database NoSQL yang kami gunakan. Berbeda dari database tradisional yang seperti spreadsheet (dengan baris dan kolom), MongoDB menyimpan data dalam format seperti dokumen JSON yang fleksibel.'
    },
    {
        term: 'Mongoose',
        definition: 'Sebuah "penerjemah" dan "penjaga aturan" untuk MongoDB. Ia membantu kode backend (Node.js) berkomunikasi dengan database dan memastikan data yang disimpan sesuai dengan struktur (Schema) yang telah kita tentukan.'
    },
    {
        term: 'Node.js',
        definition: 'Lingkungan yang memungkinkan kita menjalankan kode JavaScript di sisi server (backend), bukan hanya di browser. Ini adalah fondasi dari "dapur" aplikasi kita.'
    },
    {
        term: 'React JS',
        definition: 'Pustaka (library) JavaScript yang kami gunakan untuk membangun seluruh "ruang pamer" (frontend) aplikasi ini. React memungkinkan kita membangun antarmuka yang interaktif dan cepat dari komponen-komponen kecil.'
    },
    {
        term: 'Real-time',
        definition: 'Berarti "langsung" atau "tanpa jeda". Fitur real-time, seperti notifikasi, memungkinkan Anda melihat pembaruan (misalnya, tugas baru atau nilai) secara instan tanpa perlu me-refresh halaman.'
    },
    {
        term: 'Rute (Route)',
        definition: 'Sebuah "alamat" atau "pintu" spesifik di backend (API). Misalnya, `/api/tugas` adalah rute untuk semua hal yang berhubungan dengan tugas. Frontend akan mengunjungi rute yang tepat untuk mendapatkan data yang benar.'
    },
    {
        term: 'Schema (Skema)',
        definition: 'Sebuah "cetak biru" atau "aturan main" untuk data di database. Sebelum data disimpan, Skema (dibuat dengan Mongoose) memastikan setiap dokumen memiliki format yang benar, misalnya, setiap pengguna harus memiliki `nama`, `email`, dan `password`.'
    },
    {
        term: 'Socket.IO',
        definition: 'Teknologi yang kami gunakan untuk menciptakan komunikasi "real-time". Ia membuka jalur komunikasi dua arah langsung antara browser Anda dan server untuk pengiriman notifikasi instan.'
    },
    {
        term: 'State (React)',
        definition: 'Sebuah "memori" internal dari sebuah komponen. Ketika Anda mengetik di kolom pencarian, `state` adalah yang mengingat teks yang Anda ketik. Ketika `state` berubah, komponen akan otomatis memperbarui tampilannya.'
    },
    {
        term: 'Submission',
        definition: 'Proses atau hasil dari pengumpulan pekerjaan. Saat Anda mengunggah file tugas atau menyelesaikan kuis, Anda telah membuat sebuah "submission".'
    },
    {
        term: 'Tenggat (Deadline)',
        definition: 'Batas waktu akhir yang ditetapkan oleh dosen untuk mengumpulkan tugas atau mengerjakan kuis.'
    },
].sort((a, b) => a.term.localeCompare(b.term)); // Selalu urutkan berdasarkan abjad

const GlossaryPage = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const groupedGlossary = useMemo(() => {
        const filtered = searchTerm 
            ? glossaryData.filter(item =>
                item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.definition.toLowerCase().includes(searchTerm.toLowerCase())
              )
            : glossaryData;

        return filtered.reduce((acc, item) => {
            const firstLetter = item.term[0].toUpperCase();
            if (!acc[firstLetter]) {
                acc[firstLetter] = [];
            }
            acc[firstLetter].push(item);
            return acc;
        }, {});
    }, [searchTerm]);

    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', width: 56, height: 56 }}>
                    <MenuBookIcon />
                </Avatar>
                <Box>
                    <Typography variant="h4" fontWeight="bold">Glosarium Istilah</Typography>
                    <Typography color="text.secondary">Kamus interaktif untuk memahami platform ini lebih baik.</Typography>
                </Box>
            </Stack>

            <Paper sx={{ p: 3, mb: 3, position: 'sticky', top: 80, zIndex: 100 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Cari istilah atau definisi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />
            </Paper>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1, mb: 4 }}>
                {alphabet.map(letter => (
                    <Chip 
                        key={letter}
                        label={letter}
                        component="a"
                        href={`#letter-${letter}`}
                        clickable
                        disabled={!groupedGlossary[letter]}
                        onClick={(e) => {
                            e.preventDefault();
                            document.getElementById(`letter-${letter}`)?.scrollIntoView({ behavior: 'smooth' });
                        }}
                    />
                ))}
            </Box>

            {Object.keys(groupedGlossary).length > 0 ? (
                Object.keys(groupedGlossary).map((letter, index) => (
                    <Grow in timeout={300 + index * 100} key={letter}>
                        <Box id={`letter-${letter}`} sx={{ mb: 4 }}>
                            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                                <Avatar sx={{ bgcolor: 'primary.main' }}>{letter}</Avatar>
                                <Divider sx={{ flexGrow: 1 }} />
                            </Stack>
                            {groupedGlossary[letter].map(item => (
                                <Paper key={item.term} variant="outlined" sx={{ p: 2, mb: 2 }}>
                                    <Typography variant="h6" fontWeight="medium" color="text.primary">
                                        {item.term}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                                        {item.definition}
                                    </Typography>
                                </Paper>
                            ))}
                        </Box>
                    </Grow>
                ))
            ) : (
                <Typography sx={{ p: 4, textAlign: 'center' }} color="text.secondary">
                    Tidak ada istilah yang cocok dengan pencarian Anda.
                </Typography>
            )}
        </Container>
    );
};

export default GlossaryPage;