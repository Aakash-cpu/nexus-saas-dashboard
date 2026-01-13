import api from './api';

export const authService = {
    register: async (data) => {
        const response = await api.post('/auth/register', data);
        return response.data;
    },

    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },

    logout: async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        try {
            await api.post('/auth/logout', { refreshToken });
        } catch (error) {
            // Ignore errors, just clear local storage
        }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    },

    forgotPassword: async (email) => {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },

    resetPassword: async (token, password) => {
        const response = await api.post('/auth/reset-password', { token, password });
        return response.data;
    },

    verifyEmail: async (token) => {
        const response = await api.get(`/auth/verify-email/${token}`);
        return response.data;
    }
};

export default authService;
