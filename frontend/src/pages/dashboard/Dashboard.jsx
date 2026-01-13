import { useState, useEffect } from 'react';
import { Users, DollarSign, Activity, CheckSquare } from 'lucide-react';
import StatCard from '../../components/dashboard/StatCard';
import { LineChartCard, BarChartCard, PieChartCard } from '../../components/dashboard/ChartCard';
import ActivityFeed from '../../components/dashboard/ActivityFeed';
import QuickActions from '../../components/dashboard/QuickActions';
import Card from '../../components/common/Card';
import dashboardService from '../../services/dashboardService';
import useAuthStore from '../../store/authStore';
import './Dashboard.css';

const Dashboard = () => {
    const { user, organization } = useAuthStore();
    const [stats, setStats] = useState(null);
    const [activity, setActivity] = useState([]);
    const [charts, setCharts] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, activityRes, chartsRes] = await Promise.all([
                    dashboardService.getStats(),
                    dashboardService.getActivity({ limit: 5 }),
                    dashboardService.getCharts('7d')
                ]);

                setStats(statsRes.data);
                setActivity(activityRes.data.activities);
                setCharts(chartsRes.data);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Transform chart data
    const userGrowthData = charts?.userGrowth?.labels?.map((label, i) => ({
        label,
        value: charts.userGrowth.data[i]
    })) || [];

    const activityTrendData = charts?.activityTrend?.labels?.map((label, i) => ({
        label,
        value: charts.activityTrend.data[i]
    })) || [];

    const roleData = charts?.roleDistribution || [];

    return (
        <div className="dashboard-page">
            <div className="dashboard-welcome">
                <div className="welcome-content">
                    <h1>Welcome back, {user?.firstName}! 👋</h1>
                    <p>Here's what's happening with <strong>{organization?.name}</strong> today.</p>
                </div>
            </div>

            <section className="dashboard-section">
                <h2 className="section-title">Quick Actions</h2>
                <QuickActions />
            </section>

            <section className="dashboard-section">
                <h2 className="section-title">Overview</h2>
                <div className="stats-grid">
                    <StatCard
                        title="Total Members"
                        value={stats?.totalMembers?.value || 0}
                        change={stats?.totalMembers?.change}
                        changeType={stats?.totalMembers?.changeType}
                        icon={Users}
                        color="primary"
                    />
                    <StatCard
                        title="Active Users"
                        value={stats?.activeUsers?.value || 0}
                        change={stats?.activeUsers?.change}
                        changeType={stats?.activeUsers?.changeType}
                        icon={Activity}
                        color="success"
                    />
                    <StatCard
                        title="Revenue"
                        value={stats?.revenue?.value || '$0'}
                        change={stats?.revenue?.change}
                        changeType={stats?.revenue?.changeType}
                        icon={DollarSign}
                        color="warning"
                    />
                    <StatCard
                        title="Tasks Completed"
                        value={stats?.tasks?.value || 0}
                        change={stats?.tasks?.change}
                        changeType={stats?.tasks?.changeType}
                        icon={CheckSquare}
                        color="secondary"
                    />
                </div>
            </section>

            <section className="dashboard-section">
                <div className="charts-grid">
                    <LineChartCard
                        title="User Growth"
                        data={userGrowthData}
                        dataKey="value"
                        color="#6366f1"
                    />
                    <BarChartCard
                        title="Activity Trend"
                        data={activityTrendData}
                        dataKey="value"
                        color="#8b5cf6"
                    />
                </div>
            </section>

            <section className="dashboard-section">
                <div className="bottom-grid">
                    <Card>
                        <Card.Header>
                            <Card.Title>Recent Activity</Card.Title>
                        </Card.Header>
                        <ActivityFeed activities={activity} loading={loading} />
                    </Card>

                    <PieChartCard
                        title="Team Roles"
                        data={roleData}
                    />
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
