// src/components/GreetingBubble.js

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Avatar, Paper, Zoom, IconButton, Fab } from '@mui/material';
import { Close, Coffee, Rocket, Star, Psychology, WbSunny, NightsStay, Celebration } from '@mui/icons-material';

const GreetingBubble = ({ user, onClose, role }) => {
    const [open, setOpen] = useState(false);
    const [greeting, setGreeting] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const greetingData = {
        dosen: {
            morning: { icon: Coffee, text: `☕ ${user?.nama?.split(' ')[0]}, udah ngopi belum?`, color: '#8d6e63' },
            midday: { icon: Rocket, text: `🚀 Semangat ngajar, Prof!`, color: '#1976d2' },
            afternoon: { icon: Psychology, text: `🧠 Sore yang inspiratif!`, color: '#673ab7' },
            evening: { icon: Star, text: `⭐ Istirahat dulu yuk!`, color: '#ffc107' },
            night: { icon: NightsStay, text: `🌙 Good night, ${user?.nama?.split(' ')[0]}!`, color: '#5c6bc0' },
            weekend: { icon: Celebration, text: `🎉 Weekend vibes!`, color: '#ff5722' }
        },
        mahasiswa: {
            morning: { icon: WbSunny, text: `🌅 Pagi nih, ${user?.nama?.split(' ')[0]}!`, color: '#ff8f00' },
            midday: { icon: Rocket, text: `🚀 Semangat belajar!`, color: '#1976d2' },
            afternoon: { icon: Psychology, text: `🧠 Lanjut gas terus!`, color: '#673ab7' },
            evening: { icon: Star, text: `⭐ Keren, masih semangat!`, color: '#ffc107' },
            night: { icon: NightsStay, text: `🌙 Istirahat ya!`, color: '#5c6bc0' },
            weekend: { icon: Celebration, text: `🎉 Weekend santai!`, color: '#ff5722' }
        }
    };

    useEffect(() => {
        const hour = new Date().getHours();
        const isWeekend = [0, 6].includes(new Date().getDay());
        
        let timeKey;
        if (isWeekend) timeKey = 'weekend';
        else if (hour < 10) timeKey = 'morning';
        else if (hour < 15) timeKey = 'midday';
        else if (hour < 18) timeKey = 'afternoon';
        else if (hour < 22) timeKey = 'evening';
        else timeKey = 'night';

        setGreeting(greetingData[role][timeKey]);
        
        const showTimer = setTimeout(() => setOpen(true), 500);
        const expandTimer = setTimeout(() => setIsExpanded(true), 1000);
        const autoCloseTimer = setTimeout(handleClose, 4000);
        
        return () => {
            clearTimeout(showTimer);
            clearTimeout(expandTimer);
            clearTimeout(autoCloseTimer);
        };
    }, [user, role]);

    const handleClose = useCallback(() => {
        setIsExpanded(false);
        setTimeout(() => {
            setOpen(false);
            setTimeout(onClose, 300);
        }, 200);
    }, [onClose]);

    if (!greeting) return null;

    const IconComponent = greeting.icon;
    const gradients = {
        light: `linear-gradient(135deg, ${greeting.color}20, ${greeting.color}40)`,
        dark: `linear-gradient(135deg, ${greeting.color}40, ${greeting.color}60)`
    };

    return (
        <Zoom in={open} timeout={400}>
            <Box sx={{
                position: 'fixed',
                bottom: { xs: 16, sm: 20 },
                right: { xs: 16, sm: 20 },
                zIndex: 1300,
                transition: 'all 0.3s ease',
                transform: isExpanded ? 'scale(1)' : 'scale(0.9)'
            }}>
                {/* Compact FAB when collapsed */}
                {!isExpanded && (
                    <Fab
                        size="medium"
                        sx={{
                            bgcolor: greeting.color,
                            color: 'white',
                            animation: 'pulse 2s infinite',
                            '@keyframes pulse': {
                                '0%': { transform: 'scale(1)', boxShadow: `0 0 0 0 ${greeting.color}40` },
                                '70%': { transform: 'scale(1.05)', boxShadow: `0 0 0 10px transparent` },
                                '100%': { transform: 'scale(1)', boxShadow: `0 0 0 0 transparent` }
                            },
                            '&:hover': { bgcolor: greeting.color }
                        }}
                        onClick={() => setIsExpanded(true)}
                    >
                        <IconComponent />
                    </Fab>
                )}

                {/* Expanded bubble */}
                {isExpanded && (
                    <Paper
                        elevation={8}
                        sx={{
                            maxWidth: { xs: 200, sm: 240 },
                            borderRadius: '16px',
                            overflow: 'hidden',
                            background: theme => theme.palette.mode === 'dark' ? gradients.dark : gradients.light,
                            backdropFilter: 'blur(10px)',
                            border: theme => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.3)'}`,
                            transform: 'translateY(0)',
                            animation: 'slideUp 0.3s ease',
                            '@keyframes slideUp': {
                                from: { transform: 'translateY(20px)', opacity: 0 },
                                to: { transform: 'translateY(0)', opacity: 1 }
                            }
                        }}
                    >
                        {/* Sparkle effects */}
                        {[...Array(4)].map((_, i) => (
                            <Box
                                key={i}
                                sx={{
                                    position: 'absolute',
                                    left: `${20 + i * 25}%`,
                                    top: `${10 + i * 15}%`,
                                    width: 4,
                                    height: 4,
                                    bgcolor: 'rgba(255,255,255,0.7)',
                                    borderRadius: '50%',
                                    animation: `twinkle 2s infinite ${i * 0.5}s`,
                                    '@keyframes twinkle': {
                                        '0%, 100%': { opacity: 0, transform: 'scale(0)' },
                                        '50%': { opacity: 1, transform: 'scale(1)' }
                                    }
                                }}
                            />
                        ))}

                        <Box sx={{ p: 2, position: 'relative' }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                <Avatar
                                    sx={{
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        width: 32,
                                        height: 32,
                                        animation: 'bounce 1.5s infinite',
                                        '@keyframes bounce': {
                                            '0%, 100%': { transform: 'translateY(0)' },
                                            '50%': { transform: 'translateY(-4px)' }
                                        }
                                    }}
                                >
                                    <IconComponent sx={{ fontSize: 18, color: 'white' }} />
                                </Avatar>
                                
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: 'white',
                                            fontWeight: 500,
                                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                            lineHeight: 1.3,
                                            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                                            wordBreak: 'break-word'
                                        }}
                                    >
                                        {greeting.text}
                                    </Typography>
                                    
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: 'rgba(255,255,255,0.8)',
                                            fontSize: '0.7rem',
                                            mt: 0.5,
                                            display: 'block'
                                        }}
                                    >
                                        {new Date().toLocaleTimeString('id-ID', { 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                        })}
                                    </Typography>
                                </Box>

                                <IconButton
                                    size="small"
                                    onClick={handleClose}
                                    sx={{
                                        color: 'rgba(255,255,255,0.8)',
                                        bgcolor: 'rgba(255,255,255,0.1)',
                                        width: 24,
                                        height: 24,
                                        '&:hover': {
                                            bgcolor: 'rgba(255,255,255,0.2)',
                                            transform: 'rotate(90deg)'
                                        },
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <Close sx={{ fontSize: 14 }} />
                                </IconButton>
                            </Box>
                        </Box>
                    </Paper>
                )}

                {/* Tail for speech bubble effect */}
                {isExpanded && (
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: -6,
                            right: 20,
                            width: 12,
                            height: 12,
                            background: theme => theme.palette.mode === 'dark' ? gradients.dark : gradients.light,
                            transform: 'rotate(45deg)',
                            borderRadius: '2px'
                        }}
                    />
                )}
            </Box>
        </Zoom>
    );
};

export default GreetingBubble;