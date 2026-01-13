import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Organization name is required'],
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    logo: {
        type: String,
        default: null
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    plan: {
        type: String,
        enum: ['free', 'pro', 'enterprise'],
        default: 'free'
    },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    settings: {
        timezone: {
            type: String,
            default: 'UTC'
        },
        dateFormat: {
            type: String,
            default: 'MM/DD/YYYY'
        },
        currency: {
            type: String,
            default: 'USD'
        }
    }
}, {
    timestamps: true
});

// Generate slug from name
organizationSchema.statics.generateSlug = function (name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
        '-' + Date.now().toString(36);
};

// Get member count (virtual)
organizationSchema.virtual('memberCount', {
    ref: 'User',
    localField: '_id',
    foreignField: 'organizationId',
    count: true
});

organizationSchema.set('toJSON', { virtuals: true });
organizationSchema.set('toObject', { virtuals: true });

const Organization = mongoose.model('Organization', organizationSchema);

export default Organization;
