import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import authService from '../../services/authService';
import './Auth.css';

const VerifyEmail = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading'); // loading, success, error

    useEffect(() => {
        const verify = async () => {
            try {
                await authService.verifyEmail(token);
                setStatus('success');
            } catch (error) {
                setStatus('error');
            }
        };

        if (token) {
            verify();
        } else {
            setStatus('error');
        }
    }, [token]);

    if (status === 'loading') {
        return (
            <div className="auth-form" style={{ textAlign: 'center' }}>
                <Spinner size="lg" />
                <p style={{ marginTop: 'var(--spacing-4)', color: 'var(--text-secondary)' }}>
                    Verifying your email...
                </p>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="auth-form">
                <div className="auth-form-header">
                    <div style={{
                        width: '64px',
                        height: '64px',
                        margin: '0 auto var(--spacing-6)',
                        background: 'var(--color-error-100)',
                        borderRadius: 'var(--radius-full)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <XCircle size={28} style={{ color: 'var(--color-error-500)' }} />
                    </div>
                    <h2 className="auth-form-title">Verification failed</h2>
                    <p className="auth-form-subtitle">
                        The verification link is invalid or has expired.
                    </p>
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
                <h2 className="auth-form-title">Email verified!</h2>
                <p className="auth-form-subtitle">
                    Your email has been successfully verified. You can now access all features.
                </p>
            </div>

            <div className="auth-form-body">
                <Button
                    fullWidth
                    size="lg"
                    onClick={() => navigate('/dashboard')}
                >
                    Go to Dashboard
                </Button>
            </div>
        </div>
    );
};

export default VerifyEmail;
