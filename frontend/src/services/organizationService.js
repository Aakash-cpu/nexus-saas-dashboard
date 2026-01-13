import api from './api';

export const organizationService = {
    getOrganization: async () => {
        const response = await api.get('/organization');
        return response.data;
    },

    updateOrganization: async (data) => {
        const response = await api.put('/organization', data);
        return response.data;
    },

    getMembers: async () => {
        const response = await api.get('/organization/members');
        return response.data;
    },

    inviteMember: async (email, role) => {
        const response = await api.post('/organization/invite', { email, role });
        return response.data;
    },

    removeMember: async (id) => {
        const response = await api.delete(`/organization/members/${id}`);
        return response.data;
    },

    updateMemberRole: async (id, role) => {
        const response = await api.put(`/organization/members/${id}/role`, { role });
        return response.data;
    },

    getPendingInvites: async () => {
        const response = await api.get('/organization/invites');
        return response.data;
    },

    cancelInvite: async (id) => {
        const response = await api.delete(`/organization/invites/${id}`);
        return response.data;
    },

    acceptInvite: async (token, data) => {
        const response = await api.post('/organization/accept-invite', { token, ...data });
        return response.data;
    }
};

export default organizationService;
