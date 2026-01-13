import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: [
            'user.registered',
            'user.login',
            'user.logout',
            'user.profile_updated',
            'user.password_changed',
            'org.settings_updated',
            'org.logo_updated',
            'team.member_invited',
            'team.member_joined',
            'team.member_removed',
            'team.role_changed',
            'billing.plan_upgraded',
            'billing.plan_downgraded',
            'billing.payment_success',
            'billing.payment_failed'
        ]
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    metadata: {
        ip: String,
        userAgent: String
    }
}, {
    timestamps: true
});

// Index for efficient querying
activitySchema.index({ organizationId: 1, createdAt: -1 });
activitySchema.index({ userId: 1, createdAt: -1 });

// Static method to log activity
activitySchema.statics.log = async function (data) {
    return this.create(data);
};

// Get formatted action text
activitySchema.methods.getActionText = function () {
    const actions = {
        'user.registered': 'joined the organization',
        'user.login': 'logged in',
        'user.logout': 'logged out',
        'user.profile_updated': 'updated their profile',
        'user.password_changed': 'changed their password',
        'org.settings_updated': 'updated organization settings',
        'org.logo_updated': 'updated the organization logo',
        'team.member_invited': `invited ${this.details.email} to the team`,
        'team.member_joined': 'joined the team',
        'team.member_removed': `removed ${this.details.memberName} from the team`,
        'team.role_changed': `changed ${this.details.memberName}'s role to ${this.details.newRole}`,
        'billing.plan_upgraded': `upgraded to ${this.details.plan} plan`,
        'billing.plan_downgraded': `downgraded to ${this.details.plan} plan`,
        'billing.payment_success': 'payment processed successfully',
        'billing.payment_failed': 'payment failed'
    };
    return actions[this.action] || this.action;
};

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;
