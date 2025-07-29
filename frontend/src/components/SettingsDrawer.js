import React, { useContext, useState } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import {
    Drawer, Box, Typography, IconButton, Stack, Paper,
    ToggleButtonGroup, ToggleButton, RadioGroup, FormControlLabel, Radio,
    FormControl, InputLabel, Select, MenuItem, Chip
} from '@mui/material';
import {
    Close as CloseIcon, Brightness4 as Brightness4Icon,
    Brightness7 as Brightness7Icon
} from '@mui/icons-material';
import { fontPresets, colorPresets, radiusPresets } from '../theme';

// Theme Tab Component
const ThemeTab = ({ mode, toggleTheme }) => (
    <ToggleButtonGroup value={mode} exclusive onChange={toggleTheme} fullWidth>
        <ToggleButton value="light">
            <Stack alignItems="center" spacing={0.5}>
                <Brightness7Icon fontSize="small" />
                <Typography variant="caption">Light</Typography>
            </Stack>
        </ToggleButton>
        <ToggleButton value="dark">
            <Stack alignItems="center" spacing={0.5}>
                <Brightness4Icon fontSize="small" />
                <Typography variant="caption">Dark</Typography>
            </Stack>
        </ToggleButton>
    </ToggleButtonGroup>
);

// Colors Tab Component
const ColorsTab = ({ colorPreset, changeColorPreset }) => (
    <RadioGroup value={colorPreset} onChange={(e) => changeColorPreset(e.target.value)}>
        {Object.keys(colorPresets).map(key => (
            <FormControlLabel 
                key={key} 
                value={key} 
                control={<Radio size="small" />} 
                label={
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Box sx={{ 
                            width: 12, 
                            height: 12, 
                            borderRadius: '50%',
                            bgcolor: colorPresets[key].primary.main 
                        }} />
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                    </Stack>
                }
            />
        ))}
    </RadioGroup>
);

// Border Radius Tab Component
const BorderRadiusTab = ({ borderRadius, changeBorderRadius }) => (
    <ToggleButtonGroup 
        value={borderRadius} 
        exclusive 
        onChange={(e, val) => val && changeBorderRadius(val)} 
        orientation="vertical"
        fullWidth
    >
        {Object.keys(radiusPresets).map(key => (
            <ToggleButton key={key} value={key}>
                <Stack direction="row" justifyContent="space-between" width="100%">
                    <Typography variant="body2" textTransform="capitalize">{key}</Typography>
                    <Chip label={`${radiusPresets[key]}px`} size="small" variant="outlined" />
                </Stack>
            </ToggleButton>
        ))}
    </ToggleButtonGroup>
);

// Fonts Tab Component
const FontsTab = ({ fontFamily, changeFontFamily }) => (
    <FormControl fullWidth size="small">
        <InputLabel>Font Family</InputLabel>
        <Select 
            value={fontFamily} 
            label="Font Family" 
            onChange={(e) => changeFontFamily(e.target.value)}
        >
            {Object.keys(fontPresets).map(key => (
                <MenuItem key={key} value={key} sx={{ fontFamily: fontPresets[key].family }}>
                    {fontPresets[key].name}
                </MenuItem>
            ))}
        </Select>
    </FormControl>
);

// Tab Content Renderer
const TabContentRenderer = ({ activeTab, themeContext }) => {
    const { 
        mode, toggleTheme, colorPreset, changeColorPreset, 
        borderRadius, changeBorderRadius, fontFamily, changeFontFamily 
    } = themeContext;

    switch (activeTab) {
        case 0:
            return <ThemeTab mode={mode} toggleTheme={toggleTheme} />;
        case 1:
            return <ColorsTab colorPreset={colorPreset} changeColorPreset={changeColorPreset} />;
        case 2:
            return <BorderRadiusTab borderRadius={borderRadius} changeBorderRadius={changeBorderRadius} />;
        case 3:
            return <FontsTab fontFamily={fontFamily} changeFontFamily={changeFontFamily} />;
        default:
            return null;
    }
};

// Settings Header Component
const SettingsHeader = ({ onClose }) => (
    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={600}>Settings</Typography>
        <IconButton onClick={onClose} size="small">
            <CloseIcon />
        </IconButton>
    </Stack>
);

// Tab Navigation Component
const TabNavigation = ({ activeTab, setActiveTab, tabs }) => (
    <ToggleButtonGroup
        value={activeTab}
        exclusive
        onChange={(e, val) => val !== null && setActiveTab(val)}
        fullWidth
        size="small"
        sx={{ mb: 3 }}
    >
        {tabs.map((tab, idx) => (
            <ToggleButton key={idx} value={idx}>
                <Typography variant="caption">{tab}</Typography>
            </ToggleButton>
        ))}
    </ToggleButtonGroup>
);

// Main Settings Drawer Component
const SettingsDrawer = ({ open, onClose }) => {
    const themeContext = useContext(ThemeContext);
    const [activeTab, setActiveTab] = useState(0);

    const tabs = ['Theme', 'Colors', 'Radius', 'Fonts'];

    return (
        <Drawer 
            anchor="right" 
            open={open} 
            onClose={onClose} 
            PaperProps={{ sx: { width: 320 } }}
        >
            <Box sx={{ p: 2 }}>
                <SettingsHeader onClose={onClose} />
                
                <TabNavigation 
                    activeTab={activeTab} 
                    setActiveTab={setActiveTab} 
                    tabs={tabs} 
                />

                <Paper variant="outlined" sx={{ p: 2 }}>
                    <TabContentRenderer 
                        activeTab={activeTab} 
                        themeContext={themeContext} 
                    />
                </Paper>
            </Box>
        </Drawer>
    );
};

export default SettingsDrawer;