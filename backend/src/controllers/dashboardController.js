import User from '../models/User.js';
import Activity from '../models/Activity.js';

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
export const getStats = async (req, res, next) => {
    try {
        const organizationId = req.user.organizationId;

        // Get member count
        const totalMembers = await User.countDocuments({ organizationId });

        // Get new members this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const newMembersThisMonth = await User.countDocuments({
            organizationId,
            createdAt: { $gte: startOfMonth }
        });

        // Get activity count this week
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - 7);

        const activityThisWeek = await Activity.countDocuments({
            organizationId,
            createdAt: { $gte: startOfWeek }
        });

        // Mock data for demo (in real app, this would come from actual data)
        const stats = {
            totalMembers: {
                value: totalMembers,
                change: newMembersThisMonth > 0 ? `+${newMembersThisMonth}` : '0',
                changeType: newMembersThisMonth > 0 ? 'increase' : 'neutral'
            },
            activeUsers: {
                value: Math.floor(totalMembers * 0.85),
                change: '+12%',
                changeType: 'increase'
            },
            revenue: {
                value: '$12,450',
                change: '+8.2%',
                changeType: 'increase'
            },
            tasks: {
                value: 156,
                change: '-3%',
                changeType: 'decrease'
            }
        };

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get recent activity
// @route   GET /api/dashboard/activity
export const getActivity = async (req, res, next) => {
    try {
        const { limit = 10, page = 1 } = req.query;
        const skip = (page - 1) * limit;

        const activities = await Activity.find({
            organizationId: req.user.organizationId
        })
            .populate('userId', 'firstName lastName avatar initials')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Activity.countDocuments({
            organizationId: req.user.organizationId
        });

        const formattedActivities = activities.map(activity => ({
            id: activity._id,
            user: activity.userId ? {
                id: activity.userId._id,
                name: `${activity.userId.firstName} ${activity.userId.lastName}`,
                avatar: activity.userId.avatar,
                initials: `${activity.userId.firstName[0]}${activity.userId.lastName[0]}`
            } : null,
            action: activity.action,
            actionText: activity.getActionText(),
            details: activity.details,
            createdAt: activity.createdAt
        }));

        res.json({
            success: true,
            data: {
                activities: formattedActivities,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get chart data
// @route   GET /api/dashboard/charts
export const getCharts = async (req, res, next) => {
    try {
        const { period = '7d' } = req.query;

        // Generate date range based on period
        let days = 7;
        if (period === '30d') days = 30;
        if (period === '90d') days = 90;

        const labels = [];
        const userData = [];
        const activityData = [];
        const revenueData = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);

            const dayStart = new Date(date.setHours(0, 0, 0, 0));
            const dayEnd = new Date(date.setHours(23, 59, 59, 999));

            // Format label
            labels.push(date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            }));

            // Get actual user count for that day
            const userCount = await User.countDocuments({
                organizationId: req.user.organizationId,
                createdAt: { $lte: dayEnd }
            });
            userData.push(userCount);

            // Get activity count for that day
            const activityCount = await Activity.countDocuments({
                organizationId: req.user.organizationId,
                createdAt: { $gte: dayStart, $lte: dayEnd }
            });
            activityData.push(activityCount);

            // Mock revenue data (would come from actual transactions)
            revenueData.push(Math.floor(Math.random() * 500) + 100);
        }

        // Role distribution pie chart
        const roleDistribution = await User.aggregate([
            { $match: { organizationId: req.user.organizationId._id || req.user.organizationId } },
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);

        res.json({
            success: true,
            data: {
                userGrowth: {
                    labels,
                    data: userData
                },
                activityTrend: {
                    labels,
                    data: activityData
                },
                revenue: {
                    labels,
                    data: revenueData
                },
                roleDistribution: roleDistribution.map(r => ({
                    name: r._id.charAt(0).toUpperCase() + r._id.slice(1),
                    value: r.count
                }))
            }
        });
    } catch (error) {
        next(error);
    }
};

export default {
    getStats,
    getActivity,
    getCharts
};
