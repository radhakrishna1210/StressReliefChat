const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const OTPModel = require('../models/OTP');
const emailService = require('./emailService');
const logger = require('../utils/logger');

class OTPService {
    constructor() {
        this.OTP_LENGTH = 6;
        this.OTP_EXPIRATION_MINUTES = 5;
        this.MAX_OTP_REQUESTS_PER_15MIN = 3;
        this.MAX_VERIFICATION_ATTEMPTS = 5;
    }

    /**
     * Generate a random 6-digit OTP
     */
    generateOTP() {
        return crypto.randomInt(100000, 999999).toString();
    }

    /**
     * Hash OTP for secure storage
     */
    async hashOTP(otp) {
        return await bcrypt.hash(otp, 10);
    }

    /**
     * Verify OTP against stored hash
     */
    async verifyOTP(otp, hashedOTP) {
        return await bcrypt.compare(otp, hashedOTP);
    }

    /**
     * Check if user has exceeded OTP request rate limit
     */
    async checkRateLimit(email) {
        const recentRequests = await OTPModel.countRecentRequests(email, 15);
        if (recentRequests >= this.MAX_OTP_REQUESTS_PER_15MIN) {
            throw new Error('Too many OTP requests. Please try again in 15 minutes.');
        }
    }

    /**
     * Send OTP to user's email
     */
    async sendOTP(email) {
        try {
            // Check rate limit
            await this.checkRateLimit(email);

            // Generate OTP
            const otp = this.generateOTP();
            const hashedOTP = await this.hashOTP(otp);

            // Store in database
            await OTPModel.create(email, hashedOTP, this.OTP_EXPIRATION_MINUTES);

            // Send email
            await emailService.sendOTP(email, otp);

            logger.info(`OTP sent to ${email}`);

            // In development, also log the OTP
            if (process.env.NODE_ENV !== 'production') {
                logger.info(`DEV MODE - OTP for ${email}: ${otp}`);
            }

            return {
                success: true,
                message: 'OTP sent successfully',
                expiresIn: this.OTP_EXPIRATION_MINUTES * 60, // seconds
            };
        } catch (error) {
            logger.error('Failed to send OTP:', error);
            throw error;
        }
    }

    /**
     * Verify OTP provided by user
     */
    async verifyOTPCode(email, code) {
        try {
            // Find OTP record
            const otpRecord = await OTPModel.findByEmail(email);

            if (!otpRecord) {
                throw new Error('OTP not found or expired. Please request a new one.');
            }

            // Check attempts
            if (otpRecord.attempts >= this.MAX_VERIFICATION_ATTEMPTS) {
                await OTPModel.delete(email);
                throw new Error('Too many verification attempts. Please request a new OTP.');
            }

            // Verify OTP
            const isValid = await this.verifyOTP(code, otpRecord.code);

            if (!isValid) {
                // Increment attempts
                await OTPModel.incrementAttempts(email);
                throw new Error('Invalid OTP code. Please try again.');
            }

            // OTP is valid - delete it
            await OTPModel.delete(email);

            logger.info(`OTP verified successfully for ${email}`);

            return {
                success: true,
                message: 'OTP verified successfully',
            };
        } catch (error) {
            logger.error('OTP verification failed:', error);
            throw error;
        }
    }

    /**
     * Resend OTP (with rate limiting)
     */
    async resendOTP(email) {
        // Delete existing OTP first
        await OTPModel.delete(email);

        // Send new OTP (will check rate limit)
        return await this.sendOTP(email);
    }
}

module.exports = new OTPService();
