import express from 'express';
import organizationController from '../controllers/organizationController.js';
import { protect } from '../middleware/auth.js';
import { adminOnly, ownerOnly } from '../middleware/roleCheck.js';

const router = express.Router();

// Public route for accepting invites
router.post('/accept-invite', organizationController.acceptInvite);

// All other routes require authentication
router.use(protect);

// Get organization (all members)
router.get('/', organizationController.getOrganization);

// Update organization (admin+)
router.put('/', adminOnly, organizationController.updateOrganization);

// Member routes
router.get('/members', organizationController.getMembers);
router.post('/invite', adminOnly, organizationController.inviteMember);
router.delete('/members/:id', adminOnly, organizationController.removeMember);
router.put('/members/:id/role', ownerOnly, organizationController.updateMemberRole);

// Invite management (admin+)
router.get('/invites', adminOnly, organizationController.getPendingInvites);
router.delete('/invites/:id', adminOnly, organizationController.cancelInvite);

export default router;
