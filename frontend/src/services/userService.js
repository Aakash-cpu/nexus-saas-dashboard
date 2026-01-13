import api from './api';

export const userService = {
    getMe: async () => {
        const response = await api.get('/users/me');
        return response.data;
    },

    updateProfile: async (data) => {
        const response = await api.put('/users/me', data);
        return response.data;
    },

    changePassword: async (currentPassword, newPassword) => {
        const response = await api.put('/users/me/password', { currentPassword, newPassword });
        return response.data;
    },

    deleteAccount: async (password) => {
        const response = await api.delete('/users/me', { data: { password } });
        return response.data;
    }
};

export default userService;
