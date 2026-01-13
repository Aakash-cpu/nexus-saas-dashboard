import mongoose from 'mongoose';

const teamInviteSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true
    },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'member'],
        default: 'member'
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Check if invite is expired
teamInviteSchema.methods.isExpired = function () {
    return Date.now() > this.expiresAt;
};

// Index for auto-delete expired invites
teamInviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const TeamInvite = mongoose.model('TeamInvite', teamInviteSchema);

export default TeamInvite;
