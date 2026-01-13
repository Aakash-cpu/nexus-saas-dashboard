import express from 'express';
import authController from '../controllers/authController.js';
import { authLimiter, passwordResetLimiter } from '../middleware/rateLimiter.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/forgot-password', passwordResetLimiter, authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/verify-email/:token', authController.verifyEmail);

// Token refresh (no auth needed, uses refresh token)
router.post('/refresh', authController.refreshToken);

// Protected routes
router.post('/logout', optionalAuth, authController.logout);

export default router;
