import User from '../models/User.js';
import Activity from '../models/Activity.js';

// @desc    Get current user
// @route   GET /api/users/me
export const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).populate('organizationId');

        res.json({
            success: true,
            data: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: user.fullName,
                initials: user.initials,
                avatar: user.avatar,
                role: user.role,
                emailVerified: user.emailVerified,
                notificationPreferences: user.notificationPreferences,
                organization: user.organizationId,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update current user profile
// @route   PUT /api/users/me
export const updateMe = async (req, res, next) => {
    try {
        const allowedFields = ['firstName', 'lastName', 'avatar', 'notificationPreferences'];
        const updates = {};

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true, runValidators: true }
        );

        // Log activity
        await Activity.log({
            organizationId: req.user.organizationId,
            userId: req.user._id,
            action: 'user.profile_updated',
            details: { fields: Object.keys(updates) }
        });

        res.json({
            success: true,
            data: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: user.fullName,
                initials: user.initials,
                avatar: user.avatar,
                role: user.role,
                notificationPreferences: user.notificationPreferences
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Change password
// @route   PUT /api/users/me/password
export const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id).select('+password');

        // Verify current password
        if (!(await user.comparePassword(currentPassword))) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        user.refreshTokens = []; // Invalidate all sessions
        await user.save();

        // Log activity
        await Activity.log({
            organizationId: req.user.organizationId,
            userId: req.user._id,
            action: 'user.password_changed'
        });

        res.json({
            success: true,
            message: 'Password changed successfully. Please login again.'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete account
// @route   DELETE /api/users/me
export const deleteMe = async (req, res, next) => {
    try {
        const { password } = req.body;

        const user = await User.findById(req.user._id).select('+password');

        // Verify password
        if (!(await user.comparePassword(password))) {
            return res.status(400).json({
                success: false,
                message: 'Password is incorrect'
            });
        }

        // Check if user is organization owner
        if (user.role === 'owner') {
            return res.status(400).json({
                success: false,
                message: 'Organization owners cannot delete their account. Please transfer ownership first or delete the organization.'
            });
        }

        await User.findByIdAndDelete(req.user._id);

        res.json({
            success: true,
            message: 'Account deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

export default {
    getMe,
    updateMe,
    changePassword,
    deleteMe
};
