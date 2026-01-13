import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import useAuthStore from '../../store/authStore';
import useToastStore from '../../store/toastStore';
import './Auth.css';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuthStore();
    const toast = useToastStore();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
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
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }
        if (!formData.password) {
            newErrors.password = 'Password is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            await login(formData.email, formData.password);
            toast.success('Welcome back!', 'You have been logged in successfully');
            navigate('/dashboard');
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed. Please try again.';
            toast.error('Login failed', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-form">
            <div className="auth-form-header">
                <h2 className="auth-form-title">Welcome back</h2>
                <p className="auth-form-subtitle">
                    Sign in to your account to continue
                </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form-body">
                <Input
                    label="Email address"
                    type="email"
                    name="email"
                    icon={Mail}
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                />

                <Input
                    label="Password"
                    type="password"
                    name="password"
                    icon={Lock}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                />

                <div className="auth-form-options">
                    <label className="checkbox-label">
                        <input type="checkbox" />
                        <span>Remember me</span>
                    </label>
                    <Link to="/forgot-password" className="auth-link">
                        Forgot password?
                    </Link>
                </div>

                <Button
                    type="submit"
                    fullWidth
                    loading={loading}
                    size="lg"
                >
                    Sign in
                </Button>
            </form>

            <div className="auth-form-footer">
                <p>
                    Don't have an account?{' '}
                    <Link to="/register" className="auth-link">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
