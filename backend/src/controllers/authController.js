import User from '../models/User.js';
import Organization from '../models/Organization.js';
import Activity from '../models/Activity.js';
import { generateTokens, generateVerificationToken, generatePasswordResetToken } from '../services/tokenService.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService.js';

// @desc    Register new user and create organization
// @route   POST /api/auth/register
export const register = async (req, res, next) => {
    try {
        const { email, password, firstName, lastName, organizationName } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Generate verification token
        const verificationToken = generateVerificationToken();

        // Create user first (without organization)
        const user = await User.create({
            email,
            password,
            firstName,
            lastName,
            role: 'owner',
            verificationToken
        });

        // Create organization with the user as owner
        const orgSlug = Organization.generateSlug(organizationName);
        const organization = await Organization.create({
            name: organizationName,
            slug: orgSlug,
            plan: 'free',
            ownerId: user._id
        });

        // Update user with organization ID
        user.organizationId = organization._id;
        await user.save();

        // Log activity
        await Activity.log({
            organizationId: organization._id,
            userId: user._id,
            action: 'user.registered',
            details: { email: user.email }
        });

        // Send verification email
        try {
            await sendVerificationEmail(user, verificationToken);
        } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
        }

        // Generate tokens
        const tokens = generateTokens(user._id);

        // Save refresh token
        user.refreshTokens.push({
            token: tokens.refreshToken,
            expiresAt: tokens.refreshTokenExpiry
        });
        await user.save();

        res.status(201).json({
            success: true,
            message: 'Registration successful. Please check your email to verify your account.',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    emailVerified: user.emailVerified
                },
                organization: {
                    id: organization._id,
                    name: organization.name,
                    slug: organization.slug,
                    plan: organization.plan
                },
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find user with password
        const user = await User.findOne({ email }).select('+password').populate('organizationId');

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate tokens
        const tokens = generateTokens(user._id);

        // Save refresh token
        user.refreshTokens.push({
            token: tokens.refreshToken,
            expiresAt: tokens.refreshTokenExpiry
        });

        // Remove expired tokens
        user.refreshTokens = user.refreshTokens.filter(t => t.expiresAt > new Date());
        await user.save();

        // Log activity
        await Activity.log({
            organizationId: user.organizationId._id,
            userId: user._id,
            action: 'user.login',
            metadata: {
                ip: req.ip,
                userAgent: req.get('User-Agent')
            }
        });

        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    fullName: user.fullName,
                    avatar: user.avatar,
                    role: user.role,
                    emailVerified: user.emailVerified
                },
                organization: {
                    id: user.organizationId._id,
                    name: user.organizationId.name,
                    slug: user.organizationId.slug,
                    plan: user.organizationId.plan,
                    logo: user.organizationId.logo
                },
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
export const logout = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (req.user && refreshToken) {
            req.user.refreshTokens = req.user.refreshTokens.filter(
                t => t.token !== refreshToken
            );
            await req.user.save();

            // Log activity
            await Activity.log({
                organizationId: req.user.organizationId,
                userId: req.user._id,
                action: 'user.logout'
            });
        }

        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
export const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token is required'
            });
        }

        // Find user with this refresh token
        const user = await User.findOne({
            'refreshTokens.token': refreshToken,
            'refreshTokens.expiresAt': { $gt: new Date() }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired refresh token'
            });
        }

        // Generate new tokens
        const tokens = generateTokens(user._id);

        // Remove old refresh token and add new one
        user.refreshTokens = user.refreshTokens.filter(t => t.token !== refreshToken);
        user.refreshTokens.push({
            token: tokens.refreshToken,
            expiresAt: tokens.refreshTokenExpiry
        });
        await user.save();

        res.json({
            success: true,
            data: {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        // Always return success to prevent email enumeration
        if (!user) {
            return res.json({
                success: true,
                message: 'If an account with that email exists, we sent a password reset link'
            });
        }

        // Generate reset token
        const resetToken = generatePasswordResetToken();
        user.resetPasswordToken = resetToken.token;
        user.resetPasswordExpires = resetToken.expires;
        await user.save();

        // Send reset email
        try {
            await sendPasswordResetEmail(user, resetToken.token);
        } catch (emailError) {
            console.error('Failed to send reset email:', emailError);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();

            return res.status(500).json({
                success: false,
                message: 'Failed to send reset email. Please try again.'
            });
        }

        res.json({
            success: true,
            message: 'If an account with that email exists, we sent a password reset link'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
export const resetPassword = async (req, res, next) => {
    try {
        const { token, password } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Update password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        user.refreshTokens = []; // Invalidate all sessions
        await user.save();

        // Log activity
        await Activity.log({
            organizationId: user.organizationId,
            userId: user._id,
            action: 'user.password_changed'
        });

        res.json({
            success: true,
            message: 'Password reset successful. Please login with your new password.'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
export const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({ verificationToken: token });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid verification token'
            });
        }

        user.emailVerified = true;
        user.verificationToken = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'Email verified successfully'
        });
    } catch (error) {
        next(error);
    }
};

export default {
    register,
    login,
    logout,
    refreshToken,
    forgotPassword,
    resetPassword,
    verifyEmail
};
