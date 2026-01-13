import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import authService from '../../services/authService';
import useToastStore from '../../store/toastStore';
import './Auth.css';

const ForgotPassword = () => {
    const toast = useToastStore();
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            setError('Email is required');
            return;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Please enter a valid email');
            return;
        }

        setLoading(true);
        try {
            await authService.forgotPassword(email);
            setSent(true);
            toast.success('Email sent', 'Check your inbox for password reset instructions');
        } catch (error) {
            toast.error('Error', 'Failed to send reset email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="auth-form">
                <div className="auth-form-header">
                    <div className="success-icon" style={{
                        width: '64px',
                        height: '64px',
                        margin: '0 auto var(--spacing-6)',
                        background: 'var(--color-success-100)',
                        borderRadius: 'var(--radius-full)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Mail size={28} style={{ color: 'var(--color-success-500)' }} />
                    </div>
                    <h2 className="auth-form-title">Check your email</h2>
                    <p className="auth-form-subtitle">
                        We've sent a password reset link to <strong>{email}</strong>
                    </p>
                </div>

                <div className="auth-form-body">
                    <Button
                        variant="secondary"
                        fullWidth
                        onClick={() => setSent(false)}
                    >
                        Didn't receive email? Try again
                    </Button>
                </div>

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
    }

    return (
        <div className="auth-form">
            <div className="auth-form-header">
                <h2 className="auth-form-title">Forgot password?</h2>
                <p className="auth-form-subtitle">
                    No worries, we'll send you reset instructions.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form-body">
                <Input
                    label="Email address"
                    type="email"
                    icon={Mail}
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                    }}
                    error={error}
                />

                <div style={{ marginTop: 'var(--spacing-4)' }}>
                    <Button
                        type="submit"
                        fullWidth
                        loading={loading}
                        size="lg"
                    >
                        Send reset link
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

export default ForgotPassword;
