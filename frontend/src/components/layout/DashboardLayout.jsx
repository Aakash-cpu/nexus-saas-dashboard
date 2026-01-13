import { useState, useEffect } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';
import Spinner from '../common/Spinner';
import './DashboardLayout.css';

const pageTitles = {
    '/dashboard': 'Dashboard',
    '/dashboard/analytics': 'Analytics',
    '/dashboard/team': 'Team Management',
    '/dashboard/billing': 'Billing',
    '/dashboard/settings': 'Settings',
    '/dashboard/profile': 'Profile'
};

const DashboardLayout = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const location = useLocation();
    const { isAuthenticated, isLoading, fetchUser } = useAuthStore();
    const { initTheme } = useThemeStore();

    useEffect(() => {
        initTheme();
        fetchUser();
    }, []);

    useEffect(() => {
        setMobileSidebarOpen(false);
    }, [location.pathname]);

    if (isLoading) {
        return (
            <div className="loading-screen">
                <Spinner size="lg" />
                <p>Loading...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const pageTitle = pageTitles[location.pathname] || 'Dashboard';

    return (
        <div className={`dashboard-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            <Sidebar
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            {mobileSidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setMobileSidebarOpen(false)}
                />
            )}

            <div className="dashboard-main">
                <Header
                    title={pageTitle}
                    onMenuClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                />
                <main className="dashboard-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
