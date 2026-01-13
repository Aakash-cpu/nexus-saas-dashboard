// Role check middleware
export const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role: ${roles.join(' or ')}`
            });
        }

        next();
    };
};

// Owner only
export const ownerOnly = requireRole('owner');

// Admin or owner
export const adminOnly = requireRole('owner', 'admin');

// Any authenticated user
export const memberOnly = requireRole('owner', 'admin', 'member');

export default requireRole;
