import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    BarChart3,
    Users,
    Settings,
    CreditCard,
    User,
    LogOut,
    ChevronLeft,
    Zap
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import './Sidebar.css';

const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/dashboard/team', icon: Users, label: 'Team' },
    { path: '/dashboard/billing', icon: CreditCard, label: 'Billing' },
    { path: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

const Sidebar = ({ collapsed, onToggle }) => {
    const navigate = useNavigate();
    const { logout, organization } = useAuthStore();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <div className="logo-icon">
                        <Zap size={24} />
                    </div>
                    {!collapsed && <span className="logo-text">NEXUS</span>}
                </div>
                <button
                    className="sidebar-toggle btn btn-ghost btn-icon btn-sm"
                    onClick={onToggle}
                >
                    <ChevronLeft size={18} />
                </button>
            </div>

            {!collapsed && organization && (
                <div className="sidebar-org">
                    <div className="org-avatar">
                        {organization.logo ? (
                            <img src={organization.logo} alt={organization.name} />
                        ) : (
                            <span>{organization.name?.[0]?.toUpperCase()}</span>
                        )}
                    </div>
                    <div className="org-info">
                        <span className="org-name">{organization.name}</span>
                        <span className="org-plan">{organization.plan} plan</span>
                    </div>
                </div>
            )}

            <nav className="sidebar-nav">
                <ul className="nav-list">
                    {menuItems.map(({ path, icon: Icon, label }) => (
                        <li key={path}>
                            <NavLink
                                to={path}
                                end={path === '/dashboard'}
                                className={({ isActive }) =>
                                    `nav-link ${isActive ? 'active' : ''}`
                                }
                            >
                                <Icon size={20} />
                                {!collapsed && <span>{label}</span>}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="sidebar-footer">
                <NavLink
                    to="/dashboard/profile"
                    className={({ isActive }) =>
                        `nav-link ${isActive ? 'active' : ''}`
                    }
                >
                    <User size={20} />
                    {!collapsed && <span>Profile</span>}
                </NavLink>
                <button className="nav-link logout-btn" onClick={handleLogout}>
                    <LogOut size={20} />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
