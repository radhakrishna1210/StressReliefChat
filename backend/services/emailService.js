const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
    constructor() {
        this.transporter = null;
        this.initialize();
    }

    initialize() {
        // Configure email transporter
        const emailConfig = {
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: parseInt(process.env.SMTP_PORT || '587') === 465, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
            // Debugging entries
            connectionTimeout: 10000, // 10 seconds
            greetingTimeout: 10000,
            socketTimeout: 10000,
            logger: true,
            debug: true,
        };

        // Only create transporter if credentials are provided
        if (emailConfig.auth.user && emailConfig.auth.pass) {
            this.transporter = nodemailer.createTransport(emailConfig);
            logger.info('Email service initialized');
        } else {
            logger.warn('Email credentials not configured - emails will be logged only');
        }
    }

    async sendEmail({ to, subject, html, text }) {
        try {
            if (!this.transporter) {
                // In development, just log the email
                logger.info('EMAIL (not sent - no transporter):', {
                    to,
                    subject,
                    text: text || 'See HTML',
                });
                return { success: true, messageId: 'dev-mode' };
            }

            const mailOptions = {
                from: process.env.EMAIL_FROM || process.env.SMTP_USER,
                to,
                subject,
                html,
                text,
            };

            const info = await this.transporter.sendMail(mailOptions);
            logger.info(`Email sent to ${to}: ${info.messageId}`);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            logger.error('Failed to send email:', error);
            throw error;
        }
    }

    async sendOTP(email, otp) {
        const subject = 'Your StressReliefChat Login Code';
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .otp-code { font-size: 32px; font-weight: bold; color: #667eea; text-align: center; letter-spacing: 8px; padding: 20px; background: white; border-radius: 8px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    .warning { color: #e74c3c; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔐 Login Verification</h1>
                    </div>
                    <div class="content">
                        <p>Hello,</p>
                        <p>You requested a login code for StressReliefChat. Use the code below to complete your login:</p>
                        <div class="otp-code">${otp}</div>
                        <p>This code will expire in <strong>5 minutes</strong>.</p>
                        <p class="warning">⚠️ If you didn't request this code, please ignore this email.</p>
                        <p>For your security, never share this code with anyone.</p>
                    </div>
                    <div class="footer">
                        <p>© 2024 StressReliefChat - Your mental wellness companion</p>
                    </div>
                </div>
            </body>
            </html>
        `;
        const text = `Your StressReliefChat login code is: ${otp}\n\nThis code will expire in 5 minutes.\n\nIf you didn't request this code, please ignore this email.`;

        // Log OTP in console for development when email is not configured
        if (!this.transporter) {
            logger.info(`📧 OTP for ${email}: ${otp} (Email not sent - SMTP not configured)`);
            logger.info(`💡 Check backend console for OTP code`);
        }

        return await this.sendEmail({ to: email, subject, html, text });
    }

    async sendEmailVerification(email, token) {
        const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
        const subject = 'Verify Your Email - StressReliefChat';
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✉️ Verify Your Email</h1>
                    </div>
                    <div class="content">
                        <p>Welcome to StressReliefChat!</p>
                        <p>Please verify your email address to complete your registration:</p>
                        <div style="text-align: center;">
                            <a href="${verificationUrl}" class="button">Verify Email Address</a>
                        </div>
                        <p>Or copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
                        <p>This link will expire in 24 hours.</p>
                    </div>
                    <div class="footer">
                        <p>© 2024 StressReliefChat - Your mental wellness companion</p>
                    </div>
                </div>
            </body>
            </html>
        `;
        const text = `Welcome to StressReliefChat!\n\nPlease verify your email address by clicking this link:\n${verificationUrl}\n\nThis link will expire in 24 hours.`;

        return await this.sendEmail({ to: email, subject, html, text });
    }

    async sendPasswordReset(email, token) {
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
        const subject = 'Reset Your Password - StressReliefChat';
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    .warning { color: #e74c3c; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔑 Password Reset</h1>
                    </div>
                    <div class="content">
                        <p>You requested to reset your password for StressReliefChat.</p>
                        <p>Click the button below to reset your password:</p>
                        <div style="text-align: center;">
                            <a href="${resetUrl}" class="button">Reset Password</a>
                        </div>
                        <p>Or copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
                        <p>This link will expire in 1 hour.</p>
                        <p class="warning">⚠️ If you didn't request this, please ignore this email and your password will remain unchanged.</p>
                    </div>
                    <div class="footer">
                        <p>© 2024 StressReliefChat - Your mental wellness companion</p>
                    </div>
                </div>
            </body>
            </html>
        `;
        const text = `You requested to reset your password for StressReliefChat.\n\nClick this link to reset your password:\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.`;

        return await this.sendEmail({ to: email, subject, html, text });
    }
}

module.exports = new EmailService();
