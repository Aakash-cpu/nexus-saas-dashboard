import { create } from 'zustand';

const useToastStore = create((set, get) => ({
    toasts: [],

    addToast: ({ type = 'info', title, message, duration = 5000 }) => {
        const id = Date.now();

        set((state) => ({
            toasts: [...state.toasts, { id, type, title, message }]
        }));

        if (duration > 0) {
            setTimeout(() => {
                get().removeToast(id);
            }, duration);
        }

        return id;
    },

    removeToast: (id) => {
        set((state) => ({
            toasts: state.toasts.filter((toast) => toast.id !== id)
        }));
    },

    success: (title, message) => get().addToast({ type: 'success', title, message }),
    error: (title, message) => get().addToast({ type: 'error', title, message }),
    warning: (title, message) => get().addToast({ type: 'warning', title, message }),
    info: (title, message) => get().addToast({ type: 'info', title, message })
}));

export default useToastStore;
