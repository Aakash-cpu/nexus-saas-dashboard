import Organization from '../models/Organization.js';
import Activity from '../models/Activity.js';
import { PLANS } from '../config/stripe.js';
import stripeService from '../services/stripeService.js';
import stripe from '../config/stripe.js';

// @desc    Get available plans
// @route   GET /api/billing/plans
export const getPlans = async (req, res, next) => {
    try {
        const plans = Object.entries(PLANS).map(([key, plan]) => ({
            id: key,
            name: plan.name,
            price: plan.price,
            features: plan.features,
            current: req.user?.organizationId?.plan === key
        }));

        res.json({
            success: true,
            data: plans
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create checkout session
// @route   POST /api/billing/checkout
export const createCheckout = async (req, res, next) => {
    try {
        const { plan } = req.body;
        const organization = await Organization.findById(req.user.organizationId);

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        // Validate plan
        if (!PLANS[plan] || plan === 'free') {
            return res.status(400).json({
                success: false,
                message: 'Invalid plan selected'
            });
        }

        // Create or get Stripe customer
        if (!organization.stripeCustomerId) {
            organization.stripeCustomerId = await stripeService.getOrCreateCustomer(
                organization,
                req.user.email
            );
            await organization.save();
        }

        // Create checkout session
        const session = await stripeService.createCheckoutSession(
            organization,
            plan,
            `${process.env.FRONTEND_URL}/dashboard/billing?success=true`,
            `${process.env.FRONTEND_URL}/dashboard/billing?canceled=true`
        );

        res.json({
            success: true,
            data: {
                sessionId: session.id,
                url: session.url
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create customer portal session
// @route   POST /api/billing/portal
export const createPortal = async (req, res, next) => {
    try {
        const organization = await Organization.findById(req.user.organizationId);

        if (!organization?.stripeCustomerId) {
            return res.status(400).json({
                success: false,
                message: 'No billing information found'
            });
        }

        const session = await stripeService.createPortalSession(
            organization.stripeCustomerId,
            `${process.env.FRONTEND_URL}/dashboard/billing`
        );

        res.json({
            success: true,
            data: {
                url: session.url
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get subscription status
// @route   GET /api/billing/subscription
export const getSubscription = async (req, res, next) => {
    try {
        const organization = await Organization.findById(req.user.organizationId);

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        // Clear invalid mock customer IDs from previous sessions
        if (organization.stripeCustomerId && organization.stripeCustomerId.startsWith('mock_')) {
            organization.stripeCustomerId = null;
            await organization.save();
        }

        const subscription = await stripeService.getSubscription(
            organization.stripeSubscriptionId
        );

        let invoices = [];
        // Only fetch invoices if we have a valid (non-mock) customer ID
        if (organization.stripeCustomerId && !organization.stripeCustomerId.startsWith('mock_')) {
            try {
                invoices = await stripeService.getInvoices(organization.stripeCustomerId);
            } catch (invoiceError) {
                console.warn('Failed to fetch invoices:', invoiceError.message);
                // Continue without invoices - don't fail the whole request
            }
        }

        res.json({
            success: true,
            data: {
                plan: organization.plan,
                planDetails: PLANS[organization.plan],
                subscription: subscription ? {
                    status: subscription.status,
                    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                    cancelAtPeriodEnd: subscription.cancel_at_period_end
                } : null,
                invoices
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Handle Stripe webhook
// @route   POST /api/billing/webhook
export const handleWebhook = async (req, res, next) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        console.error('Webhook signature verification failed:', error.message);
        return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object;
            const organizationId = session.metadata.organizationId;
            const plan = session.metadata.plan;

            const organization = await Organization.findById(organizationId);
            if (organization) {
                const oldPlan = organization.plan;
                organization.plan = plan;
                organization.stripeSubscriptionId = session.subscription;
                await organization.save();

                // Log activity
                const action = PLANS[plan].price > PLANS[oldPlan].price
                    ? 'billing.plan_upgraded'
                    : 'billing.plan_downgraded';

                await Activity.log({
                    organizationId: organization._id,
                    userId: organization.ownerId,
                    action,
                    details: { plan, oldPlan }
                });
            }
            break;
        }

        case 'customer.subscription.updated': {
            const subscription = event.data.object;
            const organization = await Organization.findOne({
                stripeSubscriptionId: subscription.id
            });

            if (organization && subscription.status === 'canceled') {
                organization.plan = 'free';
                organization.stripeSubscriptionId = null;
                await organization.save();
            }
            break;
        }

        case 'customer.subscription.deleted': {
            const subscription = event.data.object;
            const organization = await Organization.findOne({
                stripeSubscriptionId: subscription.id
            });

            if (organization) {
                organization.plan = 'free';
                organization.stripeSubscriptionId = null;
                await organization.save();

                await Activity.log({
                    organizationId: organization._id,
                    userId: organization.ownerId,
                    action: 'billing.plan_downgraded',
                    details: { plan: 'free' }
                });
            }
            break;
        }

        case 'invoice.payment_succeeded': {
            const invoice = event.data.object;
            const organization = await Organization.findOne({
                stripeCustomerId: invoice.customer
            });

            if (organization) {
                await Activity.log({
                    organizationId: organization._id,
                    userId: organization.ownerId,
                    action: 'billing.payment_success',
                    details: {
                        amount: invoice.amount_paid / 100,
                        currency: invoice.currency
                    }
                });
            }
            break;
        }

        case 'invoice.payment_failed': {
            const invoice = event.data.object;
            const organization = await Organization.findOne({
                stripeCustomerId: invoice.customer
            });

            if (organization) {
                await Activity.log({
                    organizationId: organization._id,
                    userId: organization.ownerId,
                    action: 'billing.payment_failed',
                    details: {
                        amount: invoice.amount_due / 100,
                        currency: invoice.currency
                    }
                });
            }
            break;
        }

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
};

export default {
    getPlans,
    createCheckout,
    createPortal,
    getSubscription,
    handleWebhook
};
