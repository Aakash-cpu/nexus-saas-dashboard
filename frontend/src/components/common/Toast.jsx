import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import useToastStore from '../../store/toastStore';
import './Toast.css';

const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
};

const Toast = ({ id, type, title, message }) => {
    const removeToast = useToastStore((state) => state.removeToast);
    const Icon = icons[type] || Info;

    return (
        <div className={`toast ${type}`}>
            <Icon className="toast-icon" size={20} />
            <div className="toast-content">
                {title && <div className="toast-title">{title}</div>}
                {message && <div className="toast-message">{message}</div>}
            </div>
            <button
                className="toast-close"
                onClick={() => removeToast(id)}
            >
                <X size={16} />
            </button>
        </div>
    );
};

const ToastContainer = () => {
    const toasts = useToastStore((state) => state.toasts);

    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <Toast key={toast.id} {...toast} />
            ))}
        </div>
    );
};

export { Toast, ToastContainer };
export default ToastContainer;
