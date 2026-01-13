import { useState } from 'react';
import { Camera, Mail, Lock, Trash2 } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import useAuthStore from '../../store/authStore';
import useToastStore from '../../store/toastStore';
import userService from '../../services/userService';
import './Profile.css';

const Profile = () => {
    const { user, updateUser } = useAuthStore();
    const toast = useToastStore();
    const [saving, setSaving] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [profile, setProfile] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || ''
    });

    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [deletePassword, setDeletePassword] = useState('');

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const response = await userService.updateProfile(profile);
            updateUser(response.data);
            toast.success('Profile updated', 'Your profile has been saved');
        } catch (error) {
            toast.error('Error', 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error('Error', 'Passwords do not match');
            return;
        }
        if (passwords.newPassword.length < 8) {
            toast.error('Error', 'Password must be at least 8 characters');
            return;
        }

        try {
            await userService.changePassword(passwords.currentPassword, passwords.newPassword);
            toast.success('Password changed', 'Your password has been updated');
            setShowPasswordModal(false);
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error('Error', error.response?.data?.message || 'Failed to change password');
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await userService.deleteAccount(deletePassword);
            toast.success('Account deleted', 'Your account has been deleted');
            window.location.href = '/login';
        } catch (error) {
            toast.error('Error', error.response?.data?.message || 'Failed to delete account');
        }
    };

    return (
        <div className="profile-page">
            <div className="page-header">
                <div>
                    <h1>Profile</h1>
                    <p>Manage your personal information</p>
                </div>
            </div>

            <div className="profile-grid">
                <Card className="profile-card">
                    <div className="profile-avatar-section">
                        <div className="avatar-wrapper">
                            <Avatar
                                src={user?.avatar}
                                initials={user?.initials}
                                size="xl"
                            />
                            <button className="avatar-edit-btn">
                                <Camera size={16} />
                            </button>
                        </div>
                        <div className="profile-meta">
                            <h2>{user?.fullName}</h2>
                            <p>{user?.email}</p>
                            <Badge variant="primary">{user?.role}</Badge>
                        </div>
                    </div>
                </Card>

                <Card>
                    <Card.Header>
                        <Card.Title>Personal Information</Card.Title>
                    </Card.Header>
                    <Card.Body>
                        <div className="profile-form">
                            <div className="form-row">
                                <Input
                                    label="First Name"
                                    name="firstName"
                                    value={profile.firstName}
                                    onChange={handleProfileChange}
                                />
                                <Input
                                    label="Last Name"
                                    name="lastName"
                                    value={profile.lastName}
                                    onChange={handleProfileChange}
                                />
                            </div>
                            <Input
                                label="Email Address"
                                type="email"
                                value={user?.email}
                                disabled
                                hint="Email cannot be changed"
                            />
                            <Button onClick={handleSaveProfile} loading={saving}>
                                Save Changes
                            </Button>
                        </div>
                    </Card.Body>
                </Card>

                <Card>
                    <Card.Header>
                        <Card.Title>Security</Card.Title>
                    </Card.Header>
                    <Card.Body>
                        <div className="security-item">
                            <div className="security-info">
                                <Lock size={20} />
                                <div>
                                    <h3>Password</h3>
                                    <p>Change your password</p>
                                </div>
                            </div>
                            <Button variant="secondary" onClick={() => setShowPasswordModal(true)}>
                                Change Password
                            </Button>
                        </div>
                    </Card.Body>
                </Card>

                {user?.role !== 'owner' && (
                    <Card className="danger-zone">
                        <Card.Header>
                            <Card.Title>Danger Zone</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <div className="security-item">
                                <div className="security-info">
                                    <Trash2 size={20} />
                                    <div>
                                        <h3>Delete Account</h3>
                                        <p>Permanently delete your account and all data</p>
                                    </div>
                                </div>
                                <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
                                    Delete Account
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                )}
            </div>

            <Modal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                title="Change Password"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleChangePassword}>
                            Change Password
                        </Button>
                    </>
                }
            >
                <Input
                    label="Current Password"
                    type="password"
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                />
                <Input
                    label="New Password"
                    type="password"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                />
                <Input
                    label="Confirm New Password"
                    type="password"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                />
            </Modal>

            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Delete Account"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleDeleteAccount}>
                            Delete Account
                        </Button>
                    </>
                }
            >
                <p style={{ color: 'var(--color-error-500)', marginBottom: 'var(--spacing-4)' }}>
                    This action cannot be undone. All your data will be permanently deleted.
                </p>
                <Input
                    label="Enter your password to confirm"
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                />
            </Modal>
        </div>
    );
};

export default Profile;
