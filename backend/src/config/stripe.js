import Stripe from 'stripe';

// Initialize Stripe only if a valid key is provided
let stripe = null;
const stripeKey = process.env.STRIPE_SECRET_KEY;

if (stripeKey && stripeKey.startsWith('sk_')) {
    stripe = new Stripe(stripeKey);
    console.log('✅ Stripe initialized successfully');
} else {
    console.warn('⚠️  Stripe API key not configured. Billing features will be disabled.');
    // Create a mock stripe object for development
    stripe = {
        customers: { create: async () => ({ id: 'mock_customer' }), retrieve: async () => ({}) },
        checkout: { sessions: { create: async () => ({ url: '#' }) } },
        billingPortal: { sessions: { create: async () => ({ url: '#' }) } },
        subscriptions: { retrieve: async () => ({}), update: async () => ({}), list: async () => ({ data: [] }) },
        invoices: { list: async () => ({ data: [] }) },
        webhooks: { constructEvent: () => ({}) }
    };
}

export const PLANS = {
    free: {
        name: 'Free',
        price: 0,
        features: [
            '5 team members',
            'Basic analytics',
            '1GB storage',
            'Email support'
        ],
        limits: {
            teamMembers: 5,
            storage: 1073741824 // 1GB in bytes
        }
    },
    pro: {
        name: 'Pro',
        price: 29,
        priceId: process.env.STRIPE_PRICE_PRO,
        features: [
            '25 team members',
            'Advanced analytics',
            '10GB storage',
            'Priority support',
            'Custom integrations'
        ],
        limits: {
            teamMembers: 25,
            storage: 10737418240 // 10GB
        }
    },
    enterprise: {
        name: 'Enterprise',
        price: 99,
        priceId: process.env.STRIPE_PRICE_ENTERPRISE,
        features: [
            'Unlimited team members',
            'Enterprise analytics',
            '100GB storage',
            '24/7 dedicated support',
            'Custom integrations',
            'SSO & advanced security',
            'SLA guarantee'
        ],
        limits: {
            teamMembers: Infinity,
            storage: 107374182400 // 100GB
        }
    }
};

export default stripe;
