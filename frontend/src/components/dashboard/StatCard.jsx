import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import './StatCard.css';

const StatCard = ({
    title,
    value,
    change,
    changeType = 'neutral',
    icon: Icon,
    color = 'primary'
}) => {
    const ChangeIcon = changeType === 'increase'
        ? TrendingUp
        : changeType === 'decrease'
            ? TrendingDown
            : Minus;

    return (
        <div className={`stat-card stat-card-${color}`}>
            <div className="stat-card-header">
                <span className="stat-card-title">{title}</span>
                {Icon && (
                    <div className="stat-card-icon">
                        <Icon size={20} />
                    </div>
                )}
            </div>
            <div className="stat-card-value">{value}</div>
            {change && (
                <div className={`stat-card-change ${changeType}`}>
                    <ChangeIcon size={14} />
                    <span>{change}</span>
                    <span className="change-label">vs last month</span>
                </div>
            )}
        </div>
    );
};

export default StatCard;
