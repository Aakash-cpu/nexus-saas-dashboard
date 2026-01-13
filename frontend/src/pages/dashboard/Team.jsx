import { useState, useEffect } from 'react';
import { UserPlus, MoreVertical, Mail, Shield, Trash2 } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Spinner from '../../components/common/Spinner';
import organizationService from '../../services/organizationService';
import useAuthStore from '../../store/authStore';
import useToastStore from '../../store/toastStore';
import './Team.css';

const Team = () => {
    const { user } = useAuthStore();
    const toast = useToastStore();
    const [members, setMembers] = useState([]);
    const [invites, setInvites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteForm, setInviteForm] = useState({ email: '', role: 'member' });
    const [inviting, setInviting] = useState(false);

    useEffect(() => {
        fetchTeamData();
    }, []);

    const fetchTeamData = async () => {
        try {
            const [membersRes, invitesRes] = await Promise.all([
                organizationService.getMembers(),
                user.role !== 'member' ? organizationService.getPendingInvites() : Promise.resolve({ data: [] })
            ]);
            setMembers(membersRes.data);
            setInvites(invitesRes.data || []);
        } catch (error) {
            toast.error('Error', 'Failed to load team data');
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        if (!inviteForm.email) return;

        setInviting(true);
        try {
            await organizationService.inviteMember(inviteForm.email, inviteForm.role);
            toast.success('Invitation sent', `Invitation sent to ${inviteForm.email}`);
            setShowInviteModal(false);
            setInviteForm({ email: '', role: 'member' });
            fetchTeamData();
        } catch (error) {
            toast.error('Error', error.response?.data?.message || 'Failed to send invitation');
        } finally {
            setInviting(false);
        }
    };

    const handleRemoveMember = async (memberId) => {
        if (!confirm('Are you sure you want to remove this member?')) return;

        try {
            await organizationService.removeMember(memberId);
            toast.success('Member removed', 'The member has been removed from the team');
            fetchTeamData();
        } catch (error) {
            toast.error('Error', error.response?.data?.message || 'Failed to remove member');
        }
    };

    const getRoleBadgeVariant = (role) => {
        switch (role) {
            case 'owner': return 'primary';
            case 'admin': return 'warning';
            default: return 'gray';
        }
    };

    if (loading) {
        return (
            <div className="page-loading">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="team-page">
            <div className="page-header">
                <div>
                    <h1>Team Management</h1>
                    <p>Manage your team members and invitations</p>
                </div>
                {user.role !== 'member' && (
                    <Button icon={UserPlus} onClick={() => setShowInviteModal(true)}>
                        Invite Member
                    </Button>
                )}
            </div>

            <Card>
                <Card.Header>
                    <Card.Title>Team Members ({members.length})</Card.Title>
                </Card.Header>
                <div className="members-list">
                    {members.map((member) => (
                        <div key={member._id} className="member-row">
                            <div className="member-info">
                                <Avatar
                                    src={member.avatar}
                                    initials={`${member.firstName[0]}${member.lastName[0]}`}
                                    size="md"
                                />
                                <div className="member-details">
                                    <span className="member-name">
                                        {member.firstName} {member.lastName}
                                        {member._id === user.id && <span className="you-badge">(You)</span>}
                                    </span>
                                    <span className="member-email">{member.email}</span>
                                </div>
                            </div>
                            <div className="member-role">
                                <Badge variant={getRoleBadgeVariant(member.role)}>
                                    {member.role}
                                </Badge>
                            </div>
                            <div className="member-actions">
                                {user.role === 'owner' && member._id !== user.id && member.role !== 'owner' && (
                                    <button
                                        className="action-btn danger"
                                        onClick={() => handleRemoveMember(member._id)}
                                        title="Remove member"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {user.role !== 'member' && invites.length > 0 && (
                <Card style={{ marginTop: 'var(--spacing-6)' }}>
                    <Card.Header>
                        <Card.Title>Pending Invitations ({invites.length})</Card.Title>
                    </Card.Header>
                    <div className="members-list">
                        {invites.map((invite) => (
                            <div key={invite._id} className="member-row">
                                <div className="member-info">
                                    <div className="invite-avatar">
                                        <Mail size={20} />
                                    </div>
                                    <div className="member-details">
                                        <span className="member-email">{invite.email}</span>
                                        <span className="invite-status">Pending invitation</span>
                                    </div>
                                </div>
                                <div className="member-role">
                                    <Badge variant={getRoleBadgeVariant(invite.role)}>
                                        {invite.role}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            <Modal
                isOpen={showInviteModal}
                onClose={() => setShowInviteModal(false)}
                title="Invite Team Member"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setShowInviteModal(false)}>
                            Cancel
                        </Button>
                        <Button loading={inviting} onClick={handleInvite}>
                            Send Invitation
                        </Button>
                    </>
                }
            >
                <form onSubmit={handleInvite}>
                    <Input
                        label="Email address"
                        type="email"
                        icon={Mail}
                        placeholder="colleague@company.com"
                        value={inviteForm.email}
                        onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    />
                    <div className="form-group">
                        <label className="form-label">Role</label>
                        <div className="role-options">
                            <label className={`role-option ${inviteForm.role === 'member' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="role"
                                    value="member"
                                    checked={inviteForm.role === 'member'}
                                    onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                                />
                                <div className="role-icon"><Shield size={20} /></div>
                                <div className="role-info">
                                    <span className="role-title">Member</span>
                                    <span className="role-desc">Can view and access team resources</span>
                                </div>
                            </label>
                            <label className={`role-option ${inviteForm.role === 'admin' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="role"
                                    value="admin"
                                    checked={inviteForm.role === 'admin'}
                                    onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                                />
                                <div className="role-icon admin"><Shield size={20} /></div>
                                <div className="role-info">
                                    <span className="role-title">Admin</span>
                                    <span className="role-desc">Can manage team and settings</span>
                                </div>
                            </label>
                        </div>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Team;
