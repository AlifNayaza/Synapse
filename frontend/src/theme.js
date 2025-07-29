import { createTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

// 1. Definisikan Color Presets
const colorPresets = {
    orange: { primary: { main: '#f57c00', light: '#ffb74d', dark: '#e65100' }, secondary: { main: '#d32f2f', light: '#f44336', dark: '#b71c1c' } },
    blue: { primary: { main: '#1976d2', light: '#42a5f5', dark: '#1565c0' }, secondary: { main: '#9c27b0', light: '#ba68c8', dark: '#7b1fa2' } },
    green: { primary: { main: '#2e7d32', light: '#4caf50', dark: '#1b5e20' }, secondary: { main: '#ff6f00', light: '#ff8f00', dark: '#e65100' } },
    purple: { primary: { main: '#7c4dff', light: '#b085f5', dark: '#651fff' }, secondary: { main: '#ff4081', light: '#ff80ab', dark: '#c51162' } },
    teal: { primary: { main: '#00695c', light: '#4db6ac', dark: '#004d40' }, secondary: { main: '#ff7043', light: '#ffab91', dark: '#d84315' } },
    indigo: { primary: { main: '#3f51b5', light: '#7986cb', dark: '#303f9f' }, secondary: { main: '#ff5722', light: '#ff8a65', dark: '#d84315' } },
};

// 2. Definisikan Border Radius Presets
const radiusPresets = {
    none: 0,
    small: 4,
    medium: 8,
    large: 12,
    xlarge: 16,
    rounded: 24,
};

// 3. Enhanced Font Presets dengan Fallbacks
const fontPresets = {
    // Font Modern untuk UI
    inter: {
        name: 'Inter',
        family: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        description: 'Modern, clean, dan optimal untuk UI'
    },
    jakarta: {
        name: 'Plus Jakarta Sans',
        family: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        description: 'Font Indonesia yang stylish dan modern'
    },
    nunito: {
        name: 'Nunito Sans',
        family: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        description: 'Friendly dan mudah dibaca'
    },
    
    // Font Professional
    outfit: {
        name: 'Outfit',
        family: '"Outfit", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        description: 'Geometric modern yang professional'
    },
    dmsans: {
        name: 'DM Sans',
        family: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        description: 'Elegan dengan readability tinggi'
    },
    manrope: {
        name: 'Manrope',
        family: '"Manrope", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        description: 'Modern dengan curves halus'
    },
    
    // Font Unique
    spacegrotesk: {
        name: 'Space Grotesk',
        family: '"Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        description: 'Geometric dengan karakter unik'
    },
    
    // Font Klasik (tetap dipertahankan)
    poppins: {
        name: 'Poppins',
        family: '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        description: 'Rounded dan friendly'
    },
    merriweather: {
        name: 'Merriweather',
        family: '"Merriweather", "Georgia", "Times New Roman", serif',
        description: 'Serif elegan untuk konten formal'
    },
    
    // Font Monospace
    jetbrains: {
        name: 'JetBrains Mono',
        family: '"JetBrains Mono", "Fira Code", "Cascadia Code", "SF Mono", Monaco, Consolas, monospace',
        description: 'Monospace terbaik untuk kode'
    },
};

// 4. Definisikan Palet Dasar
const basePalettes = {
    light: { 
        background: { 
            default: '#f8f9fa', 
            paper: '#ffffff',
            neutral: '#f5f5f5'
        }, 
        text: { 
            primary: '#212529', 
            secondary: '#495057',
            disabled: '#9e9e9e'
        }, 
        divider: 'rgba(0, 0, 0, 0.08)',
        action: {
            hover: 'rgba(0, 0, 0, 0.04)',
            selected: 'rgba(0, 0, 0, 0.08)',
        }
    },
    dark: { 
        background: { 
            default: '#0a0a0a', 
            paper: '#1a1a1a',
            neutral: '#2a2a2a'
        }, 
        text: { 
            primary: '#f5f5f5', 
            secondary: '#b3b3b3',
            disabled: '#666666'
        }, 
        divider: 'rgba(255, 255, 255, 0.08)',
        action: {
            hover: 'rgba(255, 255, 255, 0.04)',
            selected: 'rgba(255, 255, 255, 0.08)',
        }
    },
};

// 5. Fungsi Helper untuk Typography
const createTypographySystem = (fontFamily) => {
    const baseFont = fontPresets[fontFamily]?.family || fontPresets.inter.family;
    
    return {
        fontFamily: baseFont,
        h1: {
            fontFamily: baseFont,
            fontSize: '2.5rem',
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: '-0.01562em',
        },
        h2: {
            fontFamily: baseFont,
            fontSize: '2rem',
            fontWeight: 600,
            lineHeight: 1.3,
            letterSpacing: '-0.00833em',
        },
        h3: {
            fontFamily: baseFont,
            fontSize: '1.75rem',
            fontWeight: 600,
            lineHeight: 1.3,
        },
        h4: {
            fontFamily: baseFont,
            fontSize: '1.5rem',
            fontWeight: 600,
            lineHeight: 1.4,
        },
        h5: {
            fontFamily: baseFont,
            fontSize: '1.25rem',
            fontWeight: 600,
            lineHeight: 1.4,
        },
        h6: {
            fontFamily: baseFont,
            fontSize: '1.125rem',
            fontWeight: 600,
            lineHeight: 1.4,
        },
        subtitle1: {
            fontFamily: baseFont,
            fontSize: '1rem',
            fontWeight: 500,
            lineHeight: 1.5,
        },
        subtitle2: {
            fontFamily: baseFont,
            fontSize: '0.875rem',
            fontWeight: 500,
            lineHeight: 1.5,
        },
        body1: {
            fontFamily: baseFont,
            fontSize: '1rem',
            fontWeight: 400,
            lineHeight: 1.6,
        },
        body2: {
            fontFamily: baseFont,
            fontSize: '0.875rem',
            fontWeight: 400,
            lineHeight: 1.5,
        },
        button: {
            fontFamily: baseFont,
            fontSize: '0.875rem',
            fontWeight: 500,
            lineHeight: 1.75,
            textTransform: 'none',
        },
        caption: {
            fontFamily: baseFont,
            fontSize: '0.75rem',
            fontWeight: 400,
            lineHeight: 1.4,
        },
        overline: {
            fontFamily: baseFont,
            fontSize: '0.75rem',
            fontWeight: 500,
            lineHeight: 2,
            textTransform: 'uppercase',
            letterSpacing: '0.08333em',
        },
    };
};

// 6. Fungsi Pembuat Tema Dinamis
export const createAppTheme = (mode, colorPreset = 'orange', borderRadiusPreset = 'medium', fontFamilyPreset = 'inter') => {
    const isDarkMode = mode === 'dark';
    const basePalette = basePalettes[mode];
    const preset = colorPresets[colorPreset] || colorPresets.orange;
    const borderRadius = radiusPresets[borderRadiusPreset] || radiusPresets.medium;
    const typography = createTypographySystem(fontFamilyPreset);

    const finalPalette = {
        ...basePalette,
        primary: isDarkMode ? { ...preset.primary, main: preset.primary.light } : preset.primary,
        secondary: isDarkMode ? { ...preset.secondary, main: preset.secondary.light } : preset.secondary,
        info: { 
            main: '#0288d1', 
            light: '#4fc3f7',
            dark: '#01579b',
            contrastText: '#fff'
        },
        success: { 
            main: '#2e7d32', 
            light: '#4caf50',
            dark: '#1b5e20',
            contrastText: '#fff'
        },
        warning: { 
            main: '#f57c00', 
            light: '#ff9800',
            dark: '#e65100',
            contrastText: '#fff'
        },
        error: { 
            main: '#d32f2f',
            light: '#f44336', 
            dark: '#c62828',
            contrastText: '#fff'
        },
    };

    return createTheme({
        palette: { mode, ...finalPalette },
        shape: { borderRadius },
        typography,
        spacing: 8, // Default Material-UI spacing
        
        // Custom breakpoints
        breakpoints: {
            values: {
                xs: 0,
                sm: 600,
                md: 900,
                lg: 1200,
                xl: 1536,
            },
        },
        
        // Enhanced component overrides
        components: {
            // Button Components
            MuiButton: {
                styleOverrides: {
                    root: {
                        textTransform: 'none',
                        fontWeight: 500,
                        borderRadius: borderRadius,
                        padding: '8px 20px',
                        fontSize: '0.875rem',
                        boxShadow: 'none',
                        '&:hover': {
                            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
                        },
                    },
                    contained: {
                        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                        '&:hover': {
                            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
                        },
                    },
                },
            },
            
            // Paper & Card Components
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                        borderRadius: borderRadius,
                    },
                    elevation1: {
                        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
                    },
                    elevation2: {
                        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                    },
                },
            },
            
            MuiCard: {
                styleOverrides: {
                    root: {
                        border: `1px solid ${finalPalette.divider}`,
                        backgroundImage: 'none',
                        borderRadius: borderRadius,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
                        },
                    },
                },
            },
            
            // AppBar Component
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        backgroundColor: finalPalette.background.paper,
                        color: finalPalette.text.primary,
                        boxShadow: `0 1px 3px ${alpha(finalPalette.text.primary, 0.08)}`,
                        borderBottom: `1px solid ${finalPalette.divider}`,
                    },
                },
            },
            
            // Chip Component
            MuiChip: {
                styleOverrides: {
                    root: {
                        fontWeight: 500,
                        borderRadius: borderRadius / 2,
                    },
                    colorPrimary: {
                        backgroundColor: alpha(finalPalette.primary.main, 0.12),
                        color: finalPalette.primary.dark,
                        '&:hover': {
                            backgroundColor: alpha(finalPalette.primary.main, 0.2),
                        },
                    },
                    colorSecondary: {
                        backgroundColor: alpha(finalPalette.secondary.main, 0.12),
                        color: finalPalette.secondary.dark,
                        '&:hover': {
                            backgroundColor: alpha(finalPalette.secondary.main, 0.2),
                        },
                    },
                },
            },
            
            // Input Components
            MuiTextField: {
                styleOverrides: {
                    root: {
                        '& .MuiOutlinedInput-root': {
                            borderRadius: borderRadius,
                            '& fieldset': {
                                borderColor: finalPalette.divider,
                            },
                            '&:hover fieldset': {
                                borderColor: finalPalette.primary.main,
                            },
                        },
                    },
                },
            },
            
            // Dialog Components
            MuiDialog: {
                styleOverrides: {
                    paper: {
                        borderRadius: borderRadius * 1.5,
                    },
                },
            },
            
            // Menu Components
            MuiMenu: {
                styleOverrides: {
                    paper: {
                        borderRadius: borderRadius,
                        border: `1px solid ${finalPalette.divider}`,
                        boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
                    },
                },
            },
            
            // Tab Components
            MuiTab: {
                styleOverrides: {
                    root: {
                        textTransform: 'none',
                        fontWeight: 500,
                        fontSize: '0.875rem',
                        minHeight: 48,
                        '&.Mui-selected': {
                            fontWeight: 600,
                        },
                    },
                },
            },
            
            // List Components
            MuiListItem: {
                styleOverrides: {
                    root: {
                        borderRadius: borderRadius / 2,
                        margin: '2px 0',
                        '&:hover': {
                            backgroundColor: finalPalette.action.hover,
                        },
                        '&.Mui-selected': {
                            backgroundColor: finalPalette.action.selected,
                            '&:hover': {
                                backgroundColor: alpha(finalPalette.primary.main, 0.08),
                            },
                        },
                    },
                },
            },
        },
    });
};

// 7. Export Font Presets untuk penggunaan di komponen lain
export { fontPresets, colorPresets, radiusPresets };