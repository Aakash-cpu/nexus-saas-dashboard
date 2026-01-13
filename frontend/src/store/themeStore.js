import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(
    persist(
        (set, get) => ({
            theme: 'dark', // 'light' | 'dark'

            toggleTheme: () => {
                const newTheme = get().theme === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', newTheme);
                set({ theme: newTheme });
            },

            setTheme: (theme) => {
                document.documentElement.setAttribute('data-theme', theme);
                set({ theme });
            },

            initTheme: () => {
                const { theme } = get();
                document.documentElement.setAttribute('data-theme', theme);
            }
        }),
        {
            name: 'theme-storage'
        }
    )
);

export default useThemeStore;
