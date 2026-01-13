import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import authService from '../../services/authService';
import useToastStore from '../../store/toastStore';
import './Auth.css';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const toast = useToastStore();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            await authService.resetPassword(token, formData.password);
            setSuccess(true);
            toast.success('Password reset', 'Your password has been reset successfully');
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to reset password';
            toast.error('Error', message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="auth-form">
                <div className="auth-form-header">
                    <div style={{
                        width: '64px',
                        height: '64px',
                        margin: '0 auto var(--spacing-6)',
                        background: 'var(--color-success-100)',
                        borderRadius: 'var(--radius-full)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <CheckCircle size={28} style={{ color: 'var(--color-success-500)' }} />
                    </div>
                    <h2 className="auth-form-title">Password reset!</h2>
                    <p className="auth-form-subtitle">
                        Your password has been successfully reset. You can now log in with your new password.
                    </p>
                </div>

                <div className="auth-form-body">
                    <Button
                        fullWidth
                        size="lg"
                        onClick={() => navigate('/login')}
                    >
                        Continue to login
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-form">
            <div className="auth-form-header">
                <h2 className="auth-form-title">Set new password</h2>
                <p className="auth-form-subtitle">
                    Your new password must be at least 8 characters.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form-body">
                <Input
                    label="New password"
                    type="password"
                    name="password"
                    icon={Lock}
                    placeholder="Enter new password"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                />

                <Input
                    label="Confirm password"
                    type="password"
                    name="confirmPassword"
                    icon={Lock}
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={errors.confirmPassword}
                />

                <div style={{ marginTop: 'var(--spacing-4)' }}>
                    <Button
                        type="submit"
                        fullWidth
                        loading={loading}
                        size="lg"
                    >
                        Reset password
                    </Button>
                </div>
            </form>

            <div className="auth-form-footer">
                <Link to="/login" className="auth-link" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-2)'
                }}>
                    <ArrowLeft size={16} />
                    Back to login
                </Link>
            </div>
        </div>
    );
};

export default ResetPassword;
