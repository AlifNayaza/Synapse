import React, { useContext, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import {
    AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem,
    Divider, Container, Avatar, Chip, useMediaQuery, Drawer, Stack,
    Tooltip, ButtonGroup, alpha
} from '@mui/material';
import {
    School as SchoolIcon, Menu as MenuIcon, Dashboard as DashboardIcon,
    Person as PersonIcon, ExitToApp as LogoutIcon, Brightness4 as Brightness4Icon,
    Brightness7 as Brightness7Icon, Settings as SettingsIcon
} from '@mui/icons-material';
import SettingsDrawer from './SettingsDrawer';

// Auth Buttons Component
const AuthButtons = ({ onToggleTheme, currentMode }) => (
    <Stack direction="row" spacing={1} alignItems="center">
        <Tooltip title={`Switch to ${currentMode === 'dark' ? 'Light' : 'Dark'} Mode`}>
            <IconButton onClick={onToggleTheme} size="small">
                {currentMode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
        </Tooltip>
        <ButtonGroup variant="outlined" size="small">
            <Button component={RouterLink} to="/login">Login</Button>
            <Button component={RouterLink} to="/register" variant="contained">Register</Button>
        </ButtonGroup>
    </Stack>
);

// Profile Menu Component
const ProfileMenu = ({ anchorEl, open, onClose, user, onNavigate, onLogout }) => (
    <Menu 
        anchorEl={anchorEl} 
        open={open} 
        onClose={onClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{ sx: { mt: 1, minWidth: 200 } }}
    >
        <Box sx={{ p: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main' }}>{user?.nama?.charAt(0)}</Avatar>
                <Box>
                    <Typography variant="subtitle2" fontWeight={600}>{user?.nama}</Typography>
                    <Chip label={user?.role} size="small" color="primary" variant="outlined" 
                          sx={{ textTransform: 'capitalize', fontSize: '0.7rem' }} />
                </Box>
            </Stack>
        </Box>
        <Divider />
        <MenuItem onClick={() => onNavigate(`/${user?.role}/dashboard`)} sx={{ gap: 2 }}>
            <DashboardIcon fontSize="small" />
            Dashboard
        </MenuItem>
        <MenuItem onClick={() => onNavigate('/profile')} sx={{ gap: 2 }}>
            <PersonIcon fontSize="small" />
            Profile
        </MenuItem>
        <Divider />
        <MenuItem onClick={onLogout} sx={{ gap: 2, color: 'error.main' }}>
            <LogoutIcon fontSize="small" />
            Logout
        </MenuItem>
    </Menu>
);

// Mobile Drawer Component
const MobileDrawer = ({ open, onClose, user, onNavigate, onLogout, onOpenSettings }) => (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 280 } }}>
        <Box sx={{ p: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>{user?.nama?.charAt(0)}</Avatar>
                <Box>
                    <Typography variant="h6" fontWeight={600}>{user?.nama}</Typography>
                    <Chip label={user?.role} size="small" color="primary" 
                          sx={{ textTransform: 'capitalize' }} />
                </Box>
            </Stack>
            
            <Stack spacing={1}>
                <Button startIcon={<DashboardIcon />} onClick={() => onNavigate(`/${user?.role}/dashboard`)} 
                        fullWidth sx={{ justifyContent: 'flex-start' }}>
                    Dashboard
                </Button>
                <Button startIcon={<PersonIcon />} onClick={() => onNavigate('/profile')} 
                        fullWidth sx={{ justifyContent: 'flex-start' }}>
                    Profile
                </Button>
                <Divider sx={{ my: 1 }} />
                <Button startIcon={<SettingsIcon />} onClick={onOpenSettings} 
                        fullWidth sx={{ justifyContent: 'flex-start' }}>
                    Settings
                </Button>
                <Button startIcon={<LogoutIcon />} onClick={onLogout} 
                        fullWidth color="error" sx={{ justifyContent: 'flex-start' }}>
                    Logout
                </Button>
            </Stack>
        </Box>
    </Drawer>
);

// Main Navbar Component
const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { mode, toggleTheme } = useContext(ThemeContext);
    const navigate = useNavigate();
    const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));

    const [anchorEl, setAnchorEl] = useState(null);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);

    const handleProfileMenu = (event) => setAnchorEl(event.currentTarget);
    const handleCloseProfileMenu = () => setAnchorEl(null);

    const handleLogout = () => {
        handleCloseProfileMenu();
        setMobileDrawerOpen(false);
        logout();
        navigate('/login');
    };

    const handleNavigation = (path) => {
        navigate(path);
        setMobileDrawerOpen(false);
        handleCloseProfileMenu();
    };

    const handleOpenSettings = () => {
        setSettingsOpen(true);
        setMobileDrawerOpen(false);
    };

    return (
        <>
            <AppBar 
                position="sticky" 
                elevation={0} 
                sx={{ 
                    bgcolor: alpha(mode === 'dark' ? '#121212' : '#ffffff', 0.95),
                    backdropFilter: 'blur(20px)',
                    borderBottom: 1,
                    borderColor: 'divider'
                }}
            >
                <Container maxWidth="xl">
                    <Toolbar>
                        {/* Logo */}
                        <Box 
                            component={RouterLink} 
                            to="/" 
                            sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                flexGrow: 1, 
                                textDecoration: 'none',
                                '&:hover': { opacity: 0.8 }
                            }}
                        >
                            <Avatar sx={{ bgcolor: 'primary.main', mr: 1.5 }}>
                                <SchoolIcon />
                            </Avatar>
                            <Typography 
                                variant="h5" 
                                sx={{ 
                                    color: mode === 'dark' ? 'grey.200' : 'grey.800',
                                    fontWeight: 700,
                                    display: { xs: 'none', sm: 'block' }
                                }}
                            >
                                Synapse
                            </Typography>
                        </Box>

                        {/* User Actions */}
                        {user ? (
                            isMobile ? (
                                <IconButton onClick={() => setMobileDrawerOpen(true)}>
                                    <MenuIcon />
                                </IconButton>
                            ) : (
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Button
                                        component={RouterLink}
                                        to={`/${user.role}/dashboard`}
                                        startIcon={<DashboardIcon />}
                                        variant="text"
                                        size="small"
                                        sx={{ 
                                            textTransform: 'none',
                                            fontWeight: 500,
                                            color: mode === 'dark' ? 'grey.200' : 'grey.700',
                                            '&:hover': {
                                                bgcolor: 'action.hover'
                                            }
                                        }}
                                    >
                                        Dashboard
                                    </Button>

                                    <Tooltip title="Settings">
                                        <IconButton onClick={() => setSettingsOpen(true)} size="small">
                                            <SettingsIcon />
                                        </IconButton>
                                    </Tooltip>
                                    
                                    <Chip 
                                        label={user.role} 
                                        color="primary" 
                                        variant="outlined" 
                                        size="small"
                                        sx={{ textTransform: 'capitalize', fontWeight: 500 }} 
                                    />
                                    
                                    <Tooltip title="Profile">
                                        <IconButton onClick={handleProfileMenu} sx={{ p: 0.5 }}>
                                            <Avatar sx={{ width: 36, height: 36, bgcolor: 'secondary.main' }}>
                                                {user.nama?.charAt(0)}
                                            </Avatar>
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            )
                        ) : (
                            <AuthButtons onToggleTheme={toggleTheme} currentMode={mode} />
                        )}
                    </Toolbar>
                </Container>
            </AppBar>
            
            {/* Menus and Drawers */}
            {user && !isMobile && (
                <ProfileMenu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleCloseProfileMenu}
                    user={user}
                    onNavigate={handleNavigation}
                    onLogout={handleLogout}
                />
            )}
            
            {user && isMobile && (
                <MobileDrawer
                    open={mobileDrawerOpen}
                    onClose={() => setMobileDrawerOpen(false)}
                    user={user}
                    onNavigate={handleNavigation}
                    onLogout={handleLogout}
                    onOpenSettings={handleOpenSettings}
                />
            )}
            
            <SettingsDrawer 
                open={settingsOpen} 
                onClose={() => setSettingsOpen(false)} 
            />
        </>
    );
};

export default Navbar;