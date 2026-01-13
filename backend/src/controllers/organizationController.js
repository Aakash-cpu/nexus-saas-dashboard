import Organization from '../models/Organization.js';
import User from '../models/User.js';
import TeamInvite from '../models/TeamInvite.js';
import Activity from '../models/Activity.js';
import { v4 as uuidv4 } from 'uuid';
import { sendTeamInviteEmail } from '../services/emailService.js';

// @desc    Get current organization
// @route   GET /api/organization
export const getOrganization = async (req, res, next) => {
    try {
        const organization = await Organization.findById(req.user.organizationId)
            .populate('ownerId', 'firstName lastName email avatar');

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        // Get member count
        const memberCount = await User.countDocuments({ organizationId: organization._id });

        res.json({
            success: true,
            data: {
                ...organization.toJSON(),
                memberCount
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update organization
// @route   PUT /api/organization
export const updateOrganization = async (req, res, next) => {
    try {
        const allowedFields = ['name', 'logo', 'settings'];
        const updates = {};

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const organization = await Organization.findByIdAndUpdate(
            req.user.organizationId,
            updates,
            { new: true, runValidators: true }
        );

        // Log activity
        await Activity.log({
            organizationId: organization._id,
            userId: req.user._id,
            action: updates.logo ? 'org.logo_updated' : 'org.settings_updated',
            details: { fields: Object.keys(updates) }
        });

        res.json({
            success: true,
            data: organization
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get organization members
// @route   GET /api/organization/members
export const getMembers = async (req, res, next) => {
    try {
        const members = await User.find({ organizationId: req.user.organizationId })
            .select('firstName lastName email avatar role emailVerified createdAt')
            .sort({ createdAt: 1 });

        res.json({
            success: true,
            data: members
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Invite member to organization
// @route   POST /api/organization/invite
export const inviteMember = async (req, res, next) => {
    try {
        const { email, role } = req.body;

        // Check if user already exists in org
        const existingUser = await User.findOne({
            email,
            organizationId: req.user.organizationId
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User is already a member of this organization'
            });
        }

        // Check for existing invite
        const existingInvite = await TeamInvite.findOne({
            email,
            organizationId: req.user.organizationId,
            expiresAt: { $gt: new Date() }
        });

        if (existingInvite) {
            return res.status(400).json({
                success: false,
                message: 'An invitation has already been sent to this email'
            });
        }

        // Create invite
        const invite = await TeamInvite.create({
            email,
            organizationId: req.user.organizationId,
            role: role || 'member',
            token: uuidv4(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            invitedBy: req.user._id
        });

        // Get organization for email
        const organization = await Organization.findById(req.user.organizationId);

        // Send invite email
        try {
            await sendTeamInviteEmail(email, organization, invite.role, invite.token);
        } catch (emailError) {
            console.error('Failed to send invite email:', emailError);
            await TeamInvite.findByIdAndDelete(invite._id);

            return res.status(500).json({
                success: false,
                message: 'Failed to send invitation email'
            });
        }

        // Log activity
        await Activity.log({
            organizationId: organization._id,
            userId: req.user._id,
            action: 'team.member_invited',
            details: { email, role: invite.role }
        });

        res.status(201).json({
            success: true,
            message: `Invitation sent to ${email}`,
            data: {
                id: invite._id,
                email: invite.email,
                role: invite.role,
                expiresAt: invite.expiresAt
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Accept team invite
// @route   POST /api/organization/accept-invite
export const acceptInvite = async (req, res, next) => {
    try {
        const { token, firstName, lastName, password } = req.body;

        const invite = await TeamInvite.findOne({
            token,
            expiresAt: { $gt: new Date() }
        }).populate('organizationId');

        if (!invite) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired invitation'
            });
        }

        // Check if user already exists
        let user = await User.findOne({ email: invite.email });

        if (user) {
            // User exists, just update organization
            if (user.organizationId) {
                return res.status(400).json({
                    success: false,
                    message: 'You are already a member of an organization'
                });
            }

            user.organizationId = invite.organizationId._id;
            user.role = invite.role;
            await user.save();
        } else {
            // Create new user
            user = await User.create({
                email: invite.email,
                firstName,
                lastName,
                password,
                organizationId: invite.organizationId._id,
                role: invite.role,
                emailVerified: true // Email verified through invite
            });
        }

        // Log activity
        await Activity.log({
            organizationId: invite.organizationId._id,
            userId: user._id,
            action: 'team.member_joined',
            details: { email: user.email, role: invite.role }
        });

        // Delete invite
        await TeamInvite.findByIdAndDelete(invite._id);

        res.json({
            success: true,
            message: 'Successfully joined the organization'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Remove member from organization
// @route   DELETE /api/organization/members/:id
export const removeMember = async (req, res, next) => {
    try {
        const { id } = req.params;

        const member = await User.findOne({
            _id: id,
            organizationId: req.user.organizationId
        });

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }

        // Cannot remove owner
        if (member.role === 'owner') {
            return res.status(400).json({
                success: false,
                message: 'Cannot remove the organization owner'
            });
        }

        // Cannot remove yourself
        if (member._id.equals(req.user._id)) {
            return res.status(400).json({
                success: false,
                message: 'Cannot remove yourself. Please use "Leave Organization" instead.'
            });
        }

        // Log activity before removal
        await Activity.log({
            organizationId: req.user.organizationId,
            userId: req.user._id,
            action: 'team.member_removed',
            details: { memberName: member.fullName, email: member.email }
        });

        // Remove member's organization reference
        member.organizationId = null;
        member.role = 'member';
        await member.save();

        res.json({
            success: true,
            message: 'Member removed successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update member role
// @route   PUT /api/organization/members/:id/role
export const updateMemberRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!['admin', 'member'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be admin or member'
            });
        }

        const member = await User.findOne({
            _id: id,
            organizationId: req.user.organizationId
        });

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }

        // Cannot change owner's role
        if (member.role === 'owner') {
            return res.status(400).json({
                success: false,
                message: 'Cannot change the owner\'s role'
            });
        }

        const oldRole = member.role;
        member.role = role;
        await member.save();

        // Log activity
        await Activity.log({
            organizationId: req.user.organizationId,
            userId: req.user._id,
            action: 'team.role_changed',
            details: {
                memberName: member.fullName,
                oldRole,
                newRole: role
            }
        });

        res.json({
            success: true,
            message: `${member.firstName}'s role updated to ${role}`,
            data: {
                id: member._id,
                role: member.role
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get pending invites
// @route   GET /api/organization/invites
export const getPendingInvites = async (req, res, next) => {
    try {
        const invites = await TeamInvite.find({
            organizationId: req.user.organizationId,
            expiresAt: { $gt: new Date() }
        })
            .populate('invitedBy', 'firstName lastName')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: invites
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Cancel invite
// @route   DELETE /api/organization/invites/:id
export const cancelInvite = async (req, res, next) => {
    try {
        const { id } = req.params;

        const invite = await TeamInvite.findOneAndDelete({
            _id: id,
            organizationId: req.user.organizationId
        });

        if (!invite) {
            return res.status(404).json({
                success: false,
                message: 'Invite not found'
            });
        }

        res.json({
            success: true,
            message: 'Invitation cancelled'
        });
    } catch (error) {
        next(error);
    }
};

export default {
    getOrganization,
    updateOrganization,
    getMembers,
    inviteMember,
    acceptInvite,
    removeMember,
    updateMemberRole,
    getPendingInvites,
    cancelInvite
};
