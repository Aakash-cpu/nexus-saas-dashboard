import { useState, useEffect } from 'react';
import { Check, Zap, Crown, Building2, ExternalLink } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import billingService from '../../services/billingService';
import useAuthStore from '../../store/authStore';
import useToastStore from '../../store/toastStore';
import { formatCurrency } from '../../utils/helpers';
import './Billing.css';

const planIcons = {
    free: Zap,
    pro: Crown,
    enterprise: Building2
};

const Billing = () => {
    const { organization, user } = useAuthStore();
    const toast = useToastStore();
    const [plans, setPlans] = useState([]);
    const [subscription, setSubscription] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState(null);

    useEffect(() => {
        fetchBillingData();
    }, []);

    const fetchBillingData = async () => {
        try {
            const [plansRes, subRes] = await Promise.all([
                billingService.getPlans(),
                billingService.getSubscription()
            ]);
            setPlans(plansRes.data);
            setSubscription(subRes.data.subscription);
            setInvoices(subRes.data.invoices || []);
        } catch (error) {
            toast.error('Error', 'Failed to load billing data');
        } finally {
            setLoading(false);
        }
    };

    const handleUpgrade = async (planId) => {
        if (user.role !== 'owner') {
            toast.error('Permission denied', 'Only organization owners can manage billing');
            return;
        }

        setCheckoutLoading(planId);
        try {
            const response = await billingService.createCheckout(planId);
            window.location.href = response.data.url;
        } catch (error) {
            toast.error('Error', error.response?.data?.message || 'Failed to start checkout');
        } finally {
            setCheckoutLoading(null);
        }
    };

    const handleManageBilling = async () => {
        try {
            const response = await billingService.createPortal();
            window.open(response.data.url, '_blank');
        } catch (error) {
            toast.error('Error', 'Failed to open billing portal');
        }
    };

    if (loading) {
        return (
            <div className="page-loading">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="billing-page">
            <div className="page-header">
                <div>
                    <h1>Billing & Subscription</h1>
                    <p>Manage your subscription and billing information</p>
                </div>
                {organization?.stripeCustomerId && (
                    <Button variant="secondary" icon={ExternalLink} onClick={handleManageBilling}>
                        Manage Billing
                    </Button>
                )}
            </div>

            <Card className="current-plan-card">
                <div className="current-plan-info">
                    <div className="plan-badge">
                        <Badge variant={organization?.plan === 'free' ? 'gray' : 'primary'}>
                            {organization?.plan?.toUpperCase()} PLAN
                        </Badge>
                    </div>
                    <h2>Current Plan</h2>
                    {subscription ? (
                        <p>
                            Your subscription renews on{' '}
                            <strong>{new Date(subscription.currentPeriodEnd).toLocaleDateString()}</strong>
                        </p>
                    ) : (
                        <p>You're currently on the free plan</p>
                    )}
                </div>
            </Card>

            <section className="plans-section">
                <h2>Available Plans</h2>
                <div className="plans-grid">
                    {plans.map((plan) => {
                        const PlanIcon = planIcons[plan.id] || Zap;
                        const isCurrentPlan = organization?.plan === plan.id;

                        return (
                            <Card
                                key={plan.id}
                                className={`plan-card ${isCurrentPlan ? 'current' : ''} ${plan.id === 'pro' ? 'featured' : ''}`}
                            >
                                {plan.id === 'pro' && (
                                    <div className="featured-badge">Most Popular</div>
                                )}
                                <div className="plan-icon">
                                    <PlanIcon size={28} />
                                </div>
                                <h3 className="plan-name">{plan.name}</h3>
                                <div className="plan-price">
                                    <span className="price-amount">{plan.price === 0 ? 'Free' : `$${plan.price}`}</span>
                                    {plan.price > 0 && <span className="price-period">/month</span>}
                                </div>
                                <ul className="plan-features">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx}>
                                            <Check size={16} />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="plan-action">
                                    {isCurrentPlan ? (
                                        <Button variant="secondary" disabled fullWidth>
                                            Current Plan
                                        </Button>
                                    ) : (
                                        <Button
                                            variant={plan.id === 'pro' ? 'primary' : 'secondary'}
                                            fullWidth
                                            loading={checkoutLoading === plan.id}
                                            onClick={() => handleUpgrade(plan.id)}
                                            disabled={plan.id === 'free'}
                                        >
                                            {plan.id === 'free' ? 'Free Forever' : 'Upgrade'}
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </section>

            {invoices.length > 0 && (
                <section className="invoices-section">
                    <h2>Billing History</h2>
                    <Card padding={false}>
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Invoice</th>
                                        <th>Date</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map((invoice) => (
                                        <tr key={invoice.id}>
                                            <td>{invoice.number}</td>
                                            <td>{new Date(invoice.date).toLocaleDateString()}</td>
                                            <td>{formatCurrency(invoice.amount, invoice.currency)}</td>
                                            <td>
                                                <Badge variant={invoice.status === 'paid' ? 'success' : 'warning'}>
                                                    {invoice.status}
                                                </Badge>
                                            </td>
                                            <td>
                                                <a
                                                    href={invoice.pdfUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="invoice-link"
                                                >
                                                    Download
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </section>
            )}
        </div>
    );
};

export default Billing;
