import api from './api';

export const billingService = {
    getPlans: async () => {
        const response = await api.get('/billing/plans');
        return response.data;
    },

    createCheckout: async (plan) => {
        const response = await api.post('/billing/checkout', { plan });
        return response.data;
    },

    createPortal: async () => {
        const response = await api.post('/billing/portal');
        return response.data;
    },

    getSubscription: async () => {
        const response = await api.get('/billing/subscription');
        return response.data;
    }
};

export default billingService;
