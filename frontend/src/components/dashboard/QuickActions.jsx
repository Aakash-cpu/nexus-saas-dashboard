import { useNavigate } from 'react-router-dom';
import { UserPlus, FileText, CreditCard, Settings } from 'lucide-react';
import './QuickActions.css';

const actions = [
    {
        icon: UserPlus,
        label: 'Invite Team',
        path: '/dashboard/team',
        color: 'primary'
    },
    {
        icon: FileText,
        label: 'View Reports',
        path: '/dashboard/analytics',
        color: 'secondary'
    },
    {
        icon: CreditCard,
        label: 'Billing',
        path: '/dashboard/billing',
        color: 'success'
    },
    {
        icon: Settings,
        label: 'Settings',
        path: '/dashboard/settings',
        color: 'warning'
    },
];

const QuickActions = () => {
    const navigate = useNavigate();

    return (
        <div className="quick-actions">
            {actions.map(({ icon: Icon, label, path, color }) => (
                <button
                    key={path}
                    className={`quick-action-btn quick-action-${color}`}
                    onClick={() => navigate(path)}
                >
                    <div className="quick-action-icon">
                        <Icon size={20} />
                    </div>
                    <span>{label}</span>
                </button>
            ))}
        </div>
    );
};

export default QuickActions;
