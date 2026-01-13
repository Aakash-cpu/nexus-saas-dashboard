import { forwardRef } from 'react';
import './Button.css';

const Button = forwardRef(({
    children,
    variant = 'primary',
    size = 'md',
    icon: Icon,
    iconPosition = 'left',
    loading = false,
    disabled = false,
    fullWidth = false,
    className = '',
    ...props
}, ref) => {
    const classes = [
        'btn',
        `btn-${variant}`,
        size !== 'md' && `btn-${size}`,
        fullWidth && 'btn-full',
        Icon && !children && 'btn-icon',
        className
    ].filter(Boolean).join(' ');

    return (
        <button
            ref={ref}
            className={classes}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <span className="spinner spinner-sm" />
            ) : (
                <>
                    {Icon && iconPosition === 'left' && <Icon size={18} />}
                    {children}
                    {Icon && iconPosition === 'right' && <Icon size={18} />}
                </>
            )}
        </button>
    );
});

Button.displayName = 'Button';

export default Button;
