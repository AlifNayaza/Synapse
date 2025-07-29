import React from 'react';
import { Box, Container, Typography, Link, IconButton, Stack, Divider, Grid, Avatar } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { School as SchoolIcon, Email } from '@mui/icons-material';

// --- Komponen Internal ---

// Komponen untuk Logo dan Nama Brand
const Brand = () => (
    <Stack 
        direction="row" 
        alignItems="center" 
        spacing={1.5}
        component={RouterLink}
        to="/"
        sx={{ textDecoration: 'none' }}
    >
        <Avatar sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            <SchoolIcon />
        </Avatar>
        <Typography 
            variant="h6" 
            color="text.primary"
            fontWeight="bold"
        >
            Synapse
        </Typography>
    </Stack>
);

// Komponen untuk Tautan Navigasi
const NavLinks = () => (
    <Stack 
        direction="row" 
        spacing={{ xs: 2, sm: 4 }} 
        justifyContent={{ xs: 'center', md: 'flex-start' }}
        flexWrap="wrap"
    >
        {[
            { text: 'Beranda', to: '/' },
            { text: 'Profil', to: '/profile' },
            { text: 'Bantuan', to: '/help' },
            { text: 'Glosarium', to: '/glossary' }
        ].map((link) => (
            <Link 
                key={link.text}
                component={RouterLink} 
                to={link.to} 
                color="text.secondary" 
                underline="none"
                sx={{ 
                    fontWeight: 500,
                    '&:hover': { color: 'primary.main' }
                }}
            >
                {link.text}
            </Link>
        ))}
    </Stack>
);

// Komponen untuk Link Gmail
const SocialIcons = () => (
    <Stack 
        direction="row" 
        spacing={1} 
        justifyContent={{ xs: 'center', md: 'flex-end' }}
    >
        <IconButton 
            href="mailto:lmskampusdev@gmail.com"
            aria-label="Email"
            sx={{ 
                color: 'text.secondary',
                '&:hover': { bgcolor: 'action.hover', color: 'primary.main' }
            }}
        >
            <Email />
        </IconButton>
    </Stack>
);


// --- Komponen Utama Footer ---

const Footer = () => {
    const currentYear = new Date().getFullYear();
    
    return (
        <Box
            component="footer"
            sx={{
                bgcolor: 'background.paper',
                borderTop: 1,
                borderColor: 'divider',
                mt: 'auto'
            }}
        >
            <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
                {/* Bagian Atas: Brand dan Navigasi */}
                <Grid container spacing={4} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                            <Brand />
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <NavLinks />
                    </Grid>
                </Grid>

                <Divider sx={{ my: 4 }} />

                {/* Bagian Bawah: Copyright dan Media Sosial */}
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            textAlign={{ xs: 'center', md: 'left' }}
                        >
                            {currentYear} Synapse: Platform Tugas Untuk Mahasiswa.
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <SocialIcons />
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default Footer;