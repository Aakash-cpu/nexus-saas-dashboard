import api from './api';

export const dashboardService = {
    getStats: async () => {
        const response = await api.get('/dashboard/stats');
        return response.data;
    },

    getActivity: async (params = {}) => {
        const response = await api.get('/dashboard/activity', { params });
        return response.data;
    },

    getCharts: async (period = '7d') => {
        const response = await api.get('/dashboard/charts', { params: { period } });
        return response.data;
    }
};

export default dashboardService;
