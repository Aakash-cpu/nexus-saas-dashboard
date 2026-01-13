import { formatDistanceToNow } from '../../utils/helpers';
import Avatar from '../common/Avatar';
import './ActivityFeed.css';

const ActivityFeed = ({ activities = [], loading = false }) => {
    if (loading) {
        return (
            <div className="activity-feed">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="activity-item skeleton-item">
                        <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%' }} />
                        <div style={{ flex: 1 }}>
                            <div className="skeleton" style={{ width: '60%', height: 14, marginBottom: 8 }} />
                            <div className="skeleton" style={{ width: '40%', height: 12 }} />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (activities.length === 0) {
        return (
            <div className="activity-feed empty">
                <p>No recent activity</p>
            </div>
        );
    }

    return (
        <div className="activity-feed">
            {activities.map((activity) => (
                <div key={activity.id} className="activity-item">
                    <Avatar
                        src={activity.user?.avatar}
                        initials={activity.user?.initials}
                        size="sm"
                    />
                    <div className="activity-content">
                        <p className="activity-text">
                            <strong>{activity.user?.name}</strong>
                            {' '}{activity.actionText}
                        </p>
                        <span className="activity-time">
                            {formatDistanceToNow(activity.createdAt)}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ActivityFeed;
