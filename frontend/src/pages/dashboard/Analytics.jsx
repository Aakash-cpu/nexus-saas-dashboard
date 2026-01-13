import { useState, useEffect } from 'react';
import { LineChartCard, BarChartCard, PieChartCard } from '../../components/dashboard/ChartCard';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import dashboardService from '../../services/dashboardService';
import './Analytics.css';

const Analytics = () => {
    const [period, setPeriod] = useState('7d');
    const [charts, setCharts] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCharts();
    }, [period]);

    const fetchCharts = async () => {
        setLoading(true);
        try {
            const response = await dashboardService.getCharts(period);
            setCharts(response.data);
        } catch (error) {
            console.error('Failed to fetch charts:', error);
        } finally {
            setLoading(false);
        }
    };

    const userGrowthData = charts?.userGrowth?.labels?.map((label, i) => ({
        label,
        value: charts.userGrowth.data[i]
    })) || [];

    const activityTrendData = charts?.activityTrend?.labels?.map((label, i) => ({
        label,
        value: charts.activityTrend.data[i]
    })) || [];

    const revenueData = charts?.revenue?.labels?.map((label, i) => ({
        label,
        value: charts.revenue.data[i]
    })) || [];

    const roleData = charts?.roleDistribution || [];

    if (loading) {
        return (
            <div className="page-loading">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="analytics-page">
            <div className="page-header">
                <div>
                    <h1>Analytics</h1>
                    <p>Detailed insights and metrics for your organization</p>
                </div>
                <div className="period-selector">
                    <button
                        className={`period-btn ${period === '7d' ? 'active' : ''}`}
                        onClick={() => setPeriod('7d')}
                    >
                        7 Days
                    </button>
                    <button
                        className={`period-btn ${period === '30d' ? 'active' : ''}`}
                        onClick={() => setPeriod('30d')}
                    >
                        30 Days
                    </button>
                    <button
                        className={`period-btn ${period === '90d' ? 'active' : ''}`}
                        onClick={() => setPeriod('90d')}
                    >
                        90 Days
                    </button>
                </div>
            </div>

            <div className="analytics-grid">
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
                <LineChartCard
                    title="Revenue"
                    data={revenueData}
                    dataKey="value"
                    color="#10b981"
                />
                <PieChartCard
                    title="Team Composition"
                    data={roleData}
                />
            </div>
        </div>
    );
};

export default Analytics;
