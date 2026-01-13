import './Avatar.css';

const Avatar = ({
    src,
    alt,
    initials,
    size = 'md',
    className = ''
}) => {
    const classes = [
        'avatar',
        `avatar-${size}`,
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={classes}>
            {src ? (
                <img src={src} alt={alt} />
            ) : (
                <span>{initials}</span>
            )}
        </div>
    );
};

export default Avatar;
