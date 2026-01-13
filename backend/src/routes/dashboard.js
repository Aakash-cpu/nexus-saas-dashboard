import express from 'express';
import dashboardController from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/stats', dashboardController.getStats);
router.get('/activity', dashboardController.getActivity);
router.get('/charts', dashboardController.getCharts);

export default router;
