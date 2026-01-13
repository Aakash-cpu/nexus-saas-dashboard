import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '../services/authService';
import userService from '../services/userService';

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            organization: null,
            isAuthenticated: false,
            isLoading: true,

            setUser: (user) => set({ user, isAuthenticated: !!user }),
            setOrganization: (organization) => set({ organization }),

            login: async (email, password) => {
                const response = await authService.login(email, password);
                const { user, organization, accessToken, refreshToken } = response.data;

                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);

                set({
                    user,
                    organization,
                    isAuthenticated: true,
                    isLoading: false
                });

                return response;
            },

            register: async (data) => {
                const response = await authService.register(data);
                const { user, organization, accessToken, refreshToken } = response.data;

                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);

                set({
                    user,
                    organization,
                    isAuthenticated: true,
                    isLoading: false
                });

                return response;
            },

            logout: async () => {
                await authService.logout();
                set({
                    user: null,
                    organization: null,
                    isAuthenticated: false
                });
            },

            fetchUser: async () => {
                try {
                    const token = localStorage.getItem('accessToken');
                    if (!token) {
                        set({ isLoading: false });
                        return;
                    }

                    const response = await userService.getMe();
                    set({
                        user: response.data,
                        organization: response.data.organization,
                        isAuthenticated: true,
                        isLoading: false
                    });
                } catch (error) {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    set({
                        user: null,
                        organization: null,
                        isAuthenticated: false,
                        isLoading: false
                    });
                }
            },

            updateUser: (updates) => {
                set((state) => ({
                    user: state.user ? { ...state.user, ...updates } : null
                }));
            },

            updateOrganization: (updates) => {
                set((state) => ({
                    organization: state.organization ? { ...state.organization, ...updates } : null
                }));
            }
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                organization: state.organization,
                isAuthenticated: state.isAuthenticated
            })
        }
    )
);

export default useAuthStore;
