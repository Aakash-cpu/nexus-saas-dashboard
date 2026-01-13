import { sendEmail, emailTemplates } from '../config/email.js';

export const sendVerificationEmail = async (user, token) => {
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
    const template = emailTemplates.verifyEmail(user.firstName, verifyUrl);

    await sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html
    });
};

export const sendPasswordResetEmail = async (user, token) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    const template = emailTemplates.resetPassword(user.firstName, resetUrl);

    await sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html
    });
};

export const sendTeamInviteEmail = async (email, organization, role, token) => {
    const inviteUrl = `${process.env.FRONTEND_URL}/accept-invite/${token}`;
    const template = emailTemplates.teamInvite(organization.name, role, inviteUrl);

    await sendEmail({
        to: email,
        subject: template.subject,
        html: template.html
    });
};

export default {
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendTeamInviteEmail
};
