import stripe, { PLANS } from '../config/stripe.js';

// Create or get Stripe customer
export const getOrCreateCustomer = async (organization, email) => {
    if (organization.stripeCustomerId) {
        return organization.stripeCustomerId;
    }

    const customer = await stripe.customers.create({
        email,
        name: organization.name,
        metadata: {
            organizationId: organization._id.toString()
        }
    });

    return customer.id;
};

// Create checkout session for subscription
export const createCheckoutSession = async (organization, plan, successUrl, cancelUrl) => {
    const planConfig = PLANS[plan];

    if (!planConfig || !planConfig.priceId) {
        throw new Error('Invalid plan or plan not available for subscription');
    }

    const session = await stripe.checkout.sessions.create({
        customer: organization.stripeCustomerId,
        payment_method_types: ['card'],
        line_items: [{
            price: planConfig.priceId,
            quantity: 1
        }],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
            organizationId: organization._id.toString(),
            plan
        }
    });

    return session;
};

// Create customer portal session
export const createPortalSession = async (customerId, returnUrl) => {
    const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl
    });

    return session;
};

// Get subscription details
export const getSubscription = async (subscriptionId) => {
    if (!subscriptionId) return null;

    try {
        return await stripe.subscriptions.retrieve(subscriptionId);
    } catch (error) {
        return null;
    }
};

// Cancel subscription
export const cancelSubscription = async (subscriptionId) => {
    return await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
    });
};

// Resume subscription
export const resumeSubscription = async (subscriptionId) => {
    return await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false
    });
};

// Get invoices
export const getInvoices = async (customerId, limit = 10) => {
    const invoices = await stripe.invoices.list({
        customer: customerId,
        limit
    });

    return invoices.data.map(invoice => ({
        id: invoice.id,
        number: invoice.number,
        amount: invoice.amount_paid / 100,
        currency: invoice.currency,
        status: invoice.status,
        date: new Date(invoice.created * 1000),
        pdfUrl: invoice.invoice_pdf,
        hostedUrl: invoice.hosted_invoice_url
    }));
};

export default {
    getOrCreateCustomer,
    createCheckoutSession,
    createPortalSession,
    getSubscription,
    cancelSubscription,
    resumeSubscription,
    getInvoices
};
