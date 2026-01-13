import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Zap } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import './AuthLayout.css';

const AuthLayout = () => {
    const { isAuthenticated } = useAuthStore();
    const location = useLocation();

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="auth-layout">
            <div className="auth-left">
                <div className="auth-branding">
                    <div className="auth-logo">
                        <div className="auth-logo-icon">
                            <Zap size={32} />
                        </div>
                        <span className="auth-logo-text">NEXUS</span>
                    </div>
                    <h1 className="auth-tagline">
                        The modern platform for
                        <span className="text-gradient"> team collaboration</span>
                    </h1>
                    <p className="auth-description">
                        Streamline your workflow, manage your team, and scale your business
                        with our all-in-one SaaS dashboard.
                    </p>
                    <div className="auth-features">
                        <div className="auth-feature">
                            <div className="feature-icon">🚀</div>
                            <div className="feature-text">
                                <span className="feature-title">Lightning Fast</span>
                                <span className="feature-desc">Built for performance</span>
                            </div>
                        </div>
                        <div className="auth-feature">
                            <div className="feature-icon">🔒</div>
                            <div className="feature-text">
                                <span className="feature-title">Enterprise Security</span>
                                <span className="feature-desc">Bank-level encryption</span>
                            </div>
                        </div>
                        <div className="auth-feature">
                            <div className="feature-icon">📊</div>
                            <div className="feature-text">
                                <span className="feature-title">Real-time Analytics</span>
                                <span className="feature-desc">Data-driven insights</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="auth-right">
                <div className="auth-form-container">
                    <Outlet />
                </div>
                <p className="auth-footer">
                    © 2024 Nexus. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default AuthLayout;
