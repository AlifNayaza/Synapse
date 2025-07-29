import React, { createContext, useState, useMemo, useCallback } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { createAppTheme } from '../theme';

export const ThemeContext = createContext({
    toggleTheme: () => {},
    changeColorPreset: (preset) => {},
    changeBorderRadius: (radius) => {},
    changeFontFamily: (font) => {},
    mode: 'light',
    colorPreset: 'orange',
    borderRadius: 'medium',
    fontFamily: 'inter',
});

export const ThemeProvider = ({ children }) => {
    const [mode, setMode] = useState(localStorage.getItem('themeMode') || 'light');
    const [colorPreset, setColorPreset] = useState(localStorage.getItem('themeColorPreset') || 'orange');
    const [borderRadius, setBorderRadius] = useState(localStorage.getItem('themeBorderRadius') || 'medium');
    const [fontFamily, setFontFamily] = useState(localStorage.getItem('themeFontFamily') || 'inter');

    const toggleTheme = useCallback(() => {
        setMode((prevMode) => {
            const newMode = prevMode === 'light' ? 'dark' : 'light';
            localStorage.setItem('themeMode', newMode);
            return newMode;
        });
    }, []);

    const changeColorPreset = useCallback((preset) => {
        localStorage.setItem('themeColorPreset', preset);
        setColorPreset(preset);
    }, []);

    const changeBorderRadius = useCallback((radius) => {
        localStorage.setItem('themeBorderRadius', radius);
        setBorderRadius(radius);
    }, []);

    const changeFontFamily = useCallback((font) => {
        localStorage.setItem('themeFontFamily', font);
        setFontFamily(font);
    }, []);

    const theme = useMemo(() => createAppTheme(mode, colorPreset, borderRadius, fontFamily), [mode, colorPreset, borderRadius, fontFamily]);

    return (
        <ThemeContext.Provider value={{ toggleTheme, changeColorPreset, changeBorderRadius, changeFontFamily, mode, colorPreset, borderRadius, fontFamily }}>
            <MuiThemeProvider theme={theme}>
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
};
