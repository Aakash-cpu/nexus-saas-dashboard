import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Building } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import useAuthStore from '../../store/authStore';
import useToastStore from '../../store/toastStore';
import './Auth.css';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuthStore();
    const toast = useToastStore();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        organizationName: ''
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }
        if (!formData.organizationName.trim()) {
            newErrors.organizationName = 'Organization name is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            await register(formData);
            toast.success('Welcome to Nexus!', 'Your account has been created. Please verify your email.');
            navigate('/dashboard');
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed. Please try again.';
            toast.error('Registration failed', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-form">
            <div className="auth-form-header">
                <h2 className="auth-form-title">Create an account</h2>
                <p className="auth-form-subtitle">
                    Start your 14-day free trial. No credit card required.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
                    <Input
                        label="First name"
                        type="text"
                        name="firstName"
                        icon={User}
                        placeholder="John"
                        value={formData.firstName}
                        onChange={handleChange}
                        error={errors.firstName}
                    />
                    <Input
                        label="Last name"
                        type="text"
                        name="lastName"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleChange}
                        error={errors.lastName}
                    />
                </div>

                <Input
                    label="Work email"
                    type="email"
                    name="email"
                    icon={Mail}
                    placeholder="john@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                />

                <Input
                    label="Organization name"
                    type="text"
                    name="organizationName"
                    icon={Building}
                    placeholder="Acme Inc."
                    value={formData.organizationName}
                    onChange={handleChange}
                    error={errors.organizationName}
                />

                <Input
                    label="Password"
                    type="password"
                    name="password"
                    icon={Lock}
                    placeholder="Minimum 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                />

                <div style={{ marginTop: 'var(--spacing-4)' }}>
                    <Button
                        type="submit"
                        fullWidth
                        loading={loading}
                        size="lg"
                    >
                        Create account
                    </Button>
                </div>

                <p style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--text-muted)',
                    textAlign: 'center',
                    marginTop: 'var(--spacing-4)'
                }}>
                    By signing up, you agree to our{' '}
                    <a href="#" className="auth-link">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="auth-link">Privacy Policy</a>
                </p>
            </form>

            <div className="auth-form-footer">
                <p>
                    Already have an account?{' '}
                    <Link to="/login" className="auth-link">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
