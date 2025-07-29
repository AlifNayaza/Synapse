import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // --- PERBAIKAN UTAMA ADA DI KONDISI INI ---
        // Cek jika:
        // 1. Error adalah 401 (Unauthorized)
        // 2. Request ini BUKAN dari endpoint login ATAU refresh
        // 3. Request ini belum pernah dicoba ulang
        if (
            error.response?.status === 401 && 
            originalRequest.url !== '/auth/login' && // <-- TAMBAHKAN KONDISI INI
            originalRequest.url !== '/auth/refresh' && 
            !originalRequest._retry
        ) {
            
            originalRequest._retry = true;

            try {
                console.log('Access token expired. Attempting to refresh...');
                const refreshRes = await api.post('/auth/refresh');
                const { accessToken } = refreshRes.data;

                localStorage.setItem('accessToken', accessToken);
                api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

                return api(originalRequest);

            } catch (refreshError) {
                console.error("Refresh token failed. Logging out.", refreshError.response?.data?.message || refreshError.message);
                
                localStorage.removeItem('accessToken');
                delete api.defaults.headers.common['Authorization'];
                
                // Hanya redirect jika refresh GAGAL. Jangan redirect saat login gagal.
                window.location.href = '/login'; 
                
                return Promise.reject(refreshError);
            }
        }

        // Untuk error dari /auth/login atau error lain, biarkan ia lolos
        // agar bisa ditangani oleh komponen (misal, `Login.js`)
        return Promise.reject(error);
    }
);

export default api;