// Load env vars FIRST before any other imports
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import connectDB from './config/database.js';
import errorHandler from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

// Route imports
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import organizationRoutes from './routes/organization.js';
import billingRoutes from './routes/billing.js';
import dashboardRoutes from './routes/dashboard.js';

// Connect to database
connectDB();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// Body parser - except for Stripe webhook which needs raw body
app.use((req, res, next) => {
    if (req.originalUrl === '/api/billing/webhook') {
        next();
    } else {
        express.json()(req, res, next);
    }
});

// Rate limiting
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Nexus API is running',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`
  ╔═══════════════════════════════════════════════╗
  ║                                               ║
  ║   🚀 Nexus API Server                         ║
  ║                                               ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}                    ║
  ║   Port: ${PORT}                                   ║
  ║   URL: http://localhost:${PORT}                   ║
  ║                                               ║
  ╚═══════════════════════════════════════════════╝
  `);
});

export default app;
