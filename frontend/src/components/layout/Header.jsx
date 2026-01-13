import { useState, useRef, useEffect } from 'react';
import { Bell, Search, Sun, Moon, Menu, ChevronDown } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';
import Avatar from '../common/Avatar';
import './Header.css';

const Header = ({ title, onMenuClick }) => {
    const { user } = useAuthStore();
    const { theme, toggleTheme } = useThemeStore();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="header">
            <div className="header-left">
                <button
                    className="mobile-menu-btn btn btn-ghost btn-icon"
                    onClick={onMenuClick}
                >
                    <Menu size={20} />
                </button>
                <h1 className="header-title">{title}</h1>
            </div>

            <div className="header-center">
                <div className="search-bar">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search anything..."
                        className="search-input"
                    />
                    <kbd className="search-kbd">⌘K</kbd>
                </div>
            </div>

            <div className="header-right">
                <button
                    className="btn btn-ghost btn-icon theme-toggle"
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <button className="btn btn-ghost btn-icon notification-btn">
                    <Bell size={20} />
                    <span className="notification-dot" />
                </button>

                <div className="user-menu" ref={dropdownRef}>
                    <button
                        className="user-menu-trigger"
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
                        <Avatar
                            src={user?.avatar}
                            initials={user?.initials || 'U'}
                            size="sm"
                        />
                        <div className="user-info">
                            <span className="user-name">{user?.fullName}</span>
                            <span className="user-role">{user?.role}</span>
                        </div>
                        <ChevronDown size={16} className={`chevron ${showDropdown ? 'open' : ''}`} />
                    </button>

                    {showDropdown && (
                        <div className="dropdown-menu">
                            <div className="dropdown-header">
                                <span className="dropdown-email">{user?.email}</span>
                            </div>
                            <div className="dropdown-divider" />
                            <a href="/dashboard/profile" className="dropdown-item">
                                Profile Settings
                            </a>
                            <a href="/dashboard/billing" className="dropdown-item">
                                Billing
                            </a>
                            <div className="dropdown-divider" />
                            <button className="dropdown-item danger">
                                Sign out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
