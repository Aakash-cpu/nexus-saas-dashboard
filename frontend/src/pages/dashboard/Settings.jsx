import { useState } from 'react';
import { Sun, Moon, Bell, Globe, Calendar, DollarSign } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import useThemeStore from '../../store/themeStore';
import useAuthStore from '../../store/authStore';
import organizationService from '../../services/organizationService';
import useToastStore from '../../store/toastStore';
import './Settings.css';

const Settings = () => {
    const { theme, toggleTheme } = useThemeStore();
    const { organization, updateOrganization, user } = useAuthStore();
    const toast = useToastStore();
    const [saving, setSaving] = useState(false);
    const [orgSettings, setOrgSettings] = useState({
        name: organization?.name || '',
        settings: {
            timezone: organization?.settings?.timezone || 'UTC',
            dateFormat: organization?.settings?.dateFormat || 'MM/DD/YYYY',
            currency: organization?.settings?.currency || 'USD'
        }
    });

    const handleOrgSettingChange = (field, value) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setOrgSettings(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setOrgSettings(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleSaveOrgSettings = async () => {
        setSaving(true);
        try {
            const response = await organizationService.updateOrganization(orgSettings);
            updateOrganization(response.data);
            toast.success('Settings saved', 'Organization settings have been updated');
        } catch (error) {
            toast.error('Error', 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const timezones = [
        { value: 'UTC', label: 'UTC' },
        { value: 'America/New_York', label: 'Eastern Time (ET)' },
        { value: 'America/Chicago', label: 'Central Time (CT)' },
        { value: 'America/Denver', label: 'Mountain Time (MT)' },
        { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
        { value: 'Europe/London', label: 'London (GMT)' },
        { value: 'Europe/Paris', label: 'Paris (CET)' },
        { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
        { value: 'Asia/Kolkata', label: 'India (IST)' },
    ];

    const dateFormats = [
        { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
        { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
        { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
    ];

    const currencies = [
        { value: 'USD', label: 'USD ($)' },
        { value: 'EUR', label: 'EUR (€)' },
        { value: 'GBP', label: 'GBP (£)' },
        { value: 'INR', label: 'INR (₹)' },
        { value: 'JPY', label: 'JPY (¥)' },
    ];

    return (
        <div className="settings-page">
            <div className="page-header">
                <div>
                    <h1>Settings</h1>
                    <p>Manage your application preferences</p>
                </div>
            </div>

            <section className="settings-section">
                <h2>Appearance</h2>
                <Card>
                    <div className="setting-row">
                        <div className="setting-info">
                            <div className="setting-icon">
                                {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                            </div>
                            <div>
                                <h3>Theme</h3>
                                <p>Choose between light and dark mode</p>
                            </div>
                        </div>
                        <div className="theme-toggle-group">
                            <button
                                className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                                onClick={() => theme !== 'light' && toggleTheme()}
                            >
                                <Sun size={16} />
                                Light
                            </button>
                            <button
                                className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                                onClick={() => theme !== 'dark' && toggleTheme()}
                            >
                                <Moon size={16} />
                                Dark
                            </button>
                        </div>
                    </div>
                </Card>
            </section>

            <section className="settings-section">
                <h2>Notifications</h2>
                <Card>
                    <div className="setting-row">
                        <div className="setting-info">
                            <div className="setting-icon">
                                <Bell size={20} />
                            </div>
                            <div>
                                <h3>Email Notifications</h3>
                                <p>Receive email updates about activity</p>
                            </div>
                        </div>
                        <label className="switch">
                            <input type="checkbox" defaultChecked />
                            <span className="switch-slider"></span>
                        </label>
                    </div>
                    <div className="setting-row">
                        <div className="setting-info">
                            <div className="setting-icon">
                                <Bell size={20} />
                            </div>
                            <div>
                                <h3>Push Notifications</h3>
                                <p>Receive push notifications in browser</p>
                            </div>
                        </div>
                        <label className="switch">
                            <input type="checkbox" defaultChecked />
                            <span className="switch-slider"></span>
                        </label>
                    </div>
                    <div className="setting-row">
                        <div className="setting-info">
                            <div className="setting-icon">
                                <Bell size={20} />
                            </div>
                            <div>
                                <h3>Weekly Digest</h3>
                                <p>Receive a weekly summary of activity</p>
                            </div>
                        </div>
                        <label className="switch">
                            <input type="checkbox" />
                            <span className="switch-slider"></span>
                        </label>
                    </div>
                </Card>
            </section>

            {user?.role !== 'member' && (
                <section className="settings-section">
                    <h2>Organization Settings</h2>
                    <Card>
                        <div className="form-group">
                            <label className="form-label">Organization Name</label>
                            <input
                                type="text"
                                className="form-input"
                                value={orgSettings.name}
                                onChange={(e) => handleOrgSettingChange('name', e.target.value)}
                            />
                        </div>

                        <div className="settings-grid">
                            <div className="form-group">
                                <label className="form-label">
                                    <Globe size={14} style={{ marginRight: 8 }} />
                                    Timezone
                                </label>
                                <select
                                    className="form-input"
                                    value={orgSettings.settings.timezone}
                                    onChange={(e) => handleOrgSettingChange('settings.timezone', e.target.value)}
                                >
                                    {timezones.map(tz => (
                                        <option key={tz.value} value={tz.value}>{tz.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <Calendar size={14} style={{ marginRight: 8 }} />
                                    Date Format
                                </label>
                                <select
                                    className="form-input"
                                    value={orgSettings.settings.dateFormat}
                                    onChange={(e) => handleOrgSettingChange('settings.dateFormat', e.target.value)}
                                >
                                    {dateFormats.map(df => (
                                        <option key={df.value} value={df.value}>{df.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <DollarSign size={14} style={{ marginRight: 8 }} />
                                    Currency
                                </label>
                                <select
                                    className="form-input"
                                    value={orgSettings.settings.currency}
                                    onChange={(e) => handleOrgSettingChange('settings.currency', e.target.value)}
                                >
                                    {currencies.map(c => (
                                        <option key={c.value} value={c.value}>{c.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div style={{ marginTop: 'var(--spacing-6)' }}>
                            <Button onClick={handleSaveOrgSettings} loading={saving}>
                                Save Changes
                            </Button>
                        </div>
                    </Card>
                </section>
            )}
        </div>
    );
};

export default Settings;
