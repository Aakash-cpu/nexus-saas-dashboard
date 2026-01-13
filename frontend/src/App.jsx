import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';

// Layouts
import AuthLayout from './components/layout/AuthLayout';
import DashboardLayout from './components/layout/DashboardLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';

// Dashboard Pages
import Dashboard from './pages/dashboard/Dashboard';
import Analytics from './pages/dashboard/Analytics';
import Team from './pages/dashboard/Team';
import Billing from './pages/dashboard/Billing';
import Settings from './pages/dashboard/Settings';
import Profile from './pages/dashboard/Profile';

// Other
import NotFound from './pages/NotFound';
import ToastContainer from './components/common/Toast';
import useThemeStore from './store/themeStore';

// Styles
import './styles/index.css';
import './styles/components.css';

function App() {
    const { initTheme } = useThemeStore();

    useEffect(() => {
        initTheme();
    }, [initTheme]);

    return (
        <BrowserRouter>
            <Routes>
                {/* Redirect root to dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* Auth Routes */}
                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />
                    <Route path="/verify-email/:token" element={<VerifyEmail />} />
                </Route>

                {/* Dashboard Routes */}
                <Route element={<DashboardLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/dashboard/analytics" element={<Analytics />} />
                    <Route path="/dashboard/team" element={<Team />} />
                    <Route path="/dashboard/billing" element={<Billing />} />
                    <Route path="/dashboard/settings" element={<Settings />} />
                    <Route path="/dashboard/profile" element={<Profile />} />
                </Route>

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
            </Routes>

            {/* Toast Notifications */}
            <ToastContainer />
        </BrowserRouter>
    );
}

export default App;
