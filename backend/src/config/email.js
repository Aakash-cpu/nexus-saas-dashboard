import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

export const sendEmail = async ({ to, subject, html }) => {
    try {
        const info = await transporter.sendMail({
            from: `"Nexus" <${process.env.FROM_EMAIL}>`,
            to,
            subject,
            html
        });
        console.log(`📧 Email sent: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('Email error:', error);
        throw error;
    }
};

export const emailTemplates = {
    verifyEmail: (name, verifyUrl) => ({
        subject: 'Verify your email - Nexus',
        html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #1a1a2e; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 32px; font-weight: 800; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .content { background: #f8fafc; border-radius: 16px; padding: 32px; }
            .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">NEXUS</div>
            </div>
            <div class="content">
              <h2>Welcome aboard, ${name}! 🎉</h2>
              <p>Thanks for signing up for Nexus. Please verify your email address to get started.</p>
              <center>
                <a href="${verifyUrl}" class="button">Verify Email</a>
              </center>
              <p style="color: #64748b; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              © 2024 Nexus. All rights reserved.
            </div>
          </div>
        </body>
      </html>
    `
    }),

    resetPassword: (name, resetUrl) => ({
        subject: 'Reset your password - Nexus',
        html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #1a1a2e; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 32px; font-weight: 800; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .content { background: #f8fafc; border-radius: 16px; padding: 32px; }
            .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">NEXUS</div>
            </div>
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>Hi ${name},</p>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              <center>
                <a href="${resetUrl}" class="button">Reset Password</a>
              </center>
              <p style="color: #64748b; font-size: 14px;">This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
            </div>
            <div class="footer">
              © 2024 Nexus. All rights reserved.
            </div>
          </div>
        </body>
      </html>
    `
    }),

    teamInvite: (orgName, role, inviteUrl) => ({
        subject: `You've been invited to join ${orgName} on Nexus`,
        html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #1a1a2e; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 32px; font-weight: 800; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .content { background: #f8fafc; border-radius: 16px; padding: 32px; }
            .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .badge { display: inline-block; padding: 4px 12px; background: #e0e7ff; color: #4338ca; border-radius: 20px; font-size: 14px; font-weight: 500; }
            .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">NEXUS</div>
            </div>
            <div class="content">
              <h2>You're Invited! 🎉</h2>
              <p>You've been invited to join <strong>${orgName}</strong> as a <span class="badge">${role}</span>.</p>
              <p>Click the button below to accept the invitation and join the team:</p>
              <center>
                <a href="${inviteUrl}" class="button">Accept Invitation</a>
              </center>
              <p style="color: #64748b; font-size: 14px;">This invitation will expire in 7 days.</p>
            </div>
            <div class="footer">
              © 2024 Nexus. All rights reserved.
            </div>
          </div>
        </body>
      </html>
    `
    })
};

export default transporter;
