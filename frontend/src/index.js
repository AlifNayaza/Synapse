import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import AppWrapper from './App';
import { ThemeProvider } from './context/ThemeContext'; // <<<--- GANTI IMPOR INI
import CssBaseline from '@mui/material/CssBaseline';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider> {/* <<<--- GUNAKAN THEME PROVIDER BARU */}
      <CssBaseline />
      <AppWrapper />
    </ThemeProvider>
  </React.StrictMode>
);