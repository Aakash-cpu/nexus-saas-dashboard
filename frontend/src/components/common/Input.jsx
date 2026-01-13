import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './Input.css';

const Input = forwardRef(({
    label,
    type = 'text',
    icon: Icon,
    error,
    hint,
    className = '',
    ...props
}, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    return (
        <div className={`form-group ${className}`}>
            {label && (
                <label className="form-label">{label}</label>
            )}
            <div className="input-group">
                {Icon && (
                    <span className="input-icon">
                        <Icon size={18} />
                    </span>
                )}
                <input
                    ref={ref}
                    type={inputType}
                    className={`form-input ${error ? 'error' : ''} ${Icon ? 'has-icon' : ''}`}
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        className="input-action btn btn-ghost btn-icon btn-sm"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>
            {error && <p className="form-error">{error}</p>}
            {hint && !error && <p className="form-hint">{hint}</p>}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
