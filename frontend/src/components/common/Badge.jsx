import './Badge.css';

const Badge = ({
    children,
    variant = 'primary',
    size = 'md',
    dot = false,
    className = ''
}) => {
    const classes = [
        'badge',
        `badge-${variant}`,
        size !== 'md' && `badge-${size}`,
        dot && 'badge-dot',
        className
    ].filter(Boolean).join(' ');

    return (
        <span className={classes}>
            {dot && <span className="badge-dot-indicator" />}
            {children}
        </span>
    );
};

export default Badge;
