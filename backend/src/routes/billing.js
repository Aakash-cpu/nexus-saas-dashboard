import express from 'express';
import billingController from '../controllers/billingController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { ownerOnly } from '../middleware/roleCheck.js';

const router = express.Router();

// Webhook route (needs raw body, no auth)
router.post(
    '/webhook',
    express.raw({ type: 'application/json' }),
    billingController.handleWebhook
);

// Public route to get plans
router.get('/plans', optionalAuth, billingController.getPlans);

// Protected routes
router.use(protect);

// Billing routes (owner only)
router.post('/checkout', ownerOnly, billingController.createCheckout);
router.post('/portal', ownerOnly, billingController.createPortal);
router.get('/subscription', billingController.getSubscription);

export default router;
