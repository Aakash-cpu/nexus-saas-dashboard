import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import Card from '../common/Card';
import './ChartCard.css';

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="chart-tooltip">
                <p className="tooltip-label">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} className="tooltip-value" style={{ color: entry.color }}>
                        {entry.name}: {entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export const LineChartCard = ({ title, data, dataKey = 'value', color = '#6366f1' }) => (
    <Card className="chart-card">
        <Card.Header>
            <Card.Title>{title}</Card.Title>
        </Card.Header>
        <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-secondary)" />
                    <XAxis
                        dataKey="label"
                        tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
                        axisLine={{ stroke: 'var(--border-secondary)' }}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
                        axisLine={{ stroke: 'var(--border-secondary)' }}
                        tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey={dataKey}
                        stroke={color}
                        strokeWidth={2}
                        fill={`url(#gradient-${dataKey})`}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    </Card>
);

export const BarChartCard = ({ title, data, dataKey = 'value', color = '#6366f1' }) => (
    <Card className="chart-card">
        <Card.Header>
            <Card.Title>{title}</Card.Title>
        </Card.Header>
        <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-secondary)" />
                    <XAxis
                        dataKey="label"
                        tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
                        axisLine={{ stroke: 'var(--border-secondary)' }}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
                        axisLine={{ stroke: 'var(--border-secondary)' }}
                        tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </Card>
);

export const PieChartCard = ({ title, data }) => (
    <Card className="chart-card">
        <Card.Header>
            <Card.Title>{title}</Card.Title>
        </Card.Header>
        <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        formatter={(value) => <span style={{ color: 'var(--text-secondary)' }}>{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    </Card>
);

export default { LineChartCard, BarChartCard, PieChartCard };
