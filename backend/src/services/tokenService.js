import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

// Generate access token (short-lived)
export const generateAccessToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );
};

// Generate refresh token (long-lived)
export const generateRefreshToken = () => {
    return {
        token: uuidv4(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    };
};

// Generate tokens pair
export const generateTokens = (userId) => {
    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken();

    return {
        accessToken,
        refreshToken: refreshToken.token,
        refreshTokenExpiry: refreshToken.expiresAt
    };
};

// Verify access token
export const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// Generate verification token
export const generateVerificationToken = () => {
    return uuidv4();
};

// Generate password reset token
export const generatePasswordResetToken = () => {
    return {
        token: uuidv4(),
        expires: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    };
};

export default {
    generateAccessToken,
    generateRefreshToken,
    generateTokens,
    verifyAccessToken,
    generateVerificationToken,
    generatePasswordResetToken
};
