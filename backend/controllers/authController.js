const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const UserModel = require('../models/User');
const otpService = require('../services/otpService');
const emailService = require('../services/emailService');
const { generateToken } = require('../middleware/auth');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

/**
 * Register new user with email and password
 */
const register = async (req, res, next) => {
    try {
        const { name, email, password, phone } = req.body;

        // Validate input
        if (!name || !email || !password) {
            throw new AppError('Name, email, and password are required', 400);
        }

        // Check if user already exists
        const existingUser = await UserModel.findByEmail(email);

        // If user exists and has a password, they're already registered
        if (existingUser && existingUser.password) {
            throw new AppError('User with this email already exists', 409);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Generate email verification token
        const emailVerificationToken = crypto.randomBytes(32).toString('hex');

        let user;

        // If user was pre-created by admin (listener without password), update them
        if (existingUser && !existingUser.password) {
            await UserModel.update(email, {
                name,
                phone,
                password: hashedPassword,
                provider: 'local',
                emailVerificationToken,
                // Preserve the role (listener) that was set by admin
            });

            // Fetch the updated user to ensure we have all fields
            user = await UserModel.findByEmail(email);
            logger.info(`Listener completed registration: ${email}`);
        } else {
            // Create new user
            user = await UserModel.create({
                name,
                email,
                phone,
                password: hashedPassword,
                provider: 'local',
                emailVerificationToken,
            });
        }

        // Send verification email
        try {
            await emailService.sendEmailVerification(email, emailVerificationToken);
        } catch (emailError) {
            logger.error('Failed to send verification email:', emailError);
            // Don't fail registration if email fails
        }

        // Generate JWT token
        const token = generateToken({
            userId: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
        });

        logger.info(`User registered: ${email}`);

        res.status(201).json({
            success: true,
            message: 'Registration successful. Please check your email to verify your account.',
            data: {
                user: {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    emailVerified: user.emailVerified,
                    role: user.role,
                },
                token,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Login with email and password
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            throw new AppError('Email and password are required', 400);
        }

        // Check if account is locked
        const isLocked = await UserModel.isLocked(email);
        if (isLocked) {
            throw new AppError('Account is temporarily locked due to too many failed login attempts. Please try again in 15 minutes.', 423);
        }

        // Find user
        const user = await UserModel.findByEmail(email);
        if (!user || !user.password) {
            await UserModel.incrementLoginAttempts(email);
            throw new AppError('Invalid email or password', 401);
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            await UserModel.incrementLoginAttempts(email);
            throw new AppError('Invalid email or password', 401);
        }

        // Reset login attempts on successful login
        await UserModel.resetLoginAttempts(email);

        // Generate JWT token
        const token = generateToken({
            userId: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
        });

        logger.info(`User logged in: ${email}`);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    emailVerified: user.emailVerified,
                    role: user.role,
                },
                token,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Send OTP to email for passwordless login
 */
const sendOTP = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            throw new AppError('Email is required', 400);
        }

        // Send OTP
        const result = await otpService.sendOTP(email);

        res.json({
            success: true,
            message: result.message,
            data: {
                expiresIn: result.expiresIn,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Verify OTP and login/register user
 */
const verifyOTP = async (req, res, next) => {
    try {
        const { email, code, name, phone } = req.body;

        if (!email || !code) {
            throw new AppError('Email and OTP code are required', 400);
        }

        // Verify OTP
        await otpService.verifyOTPCode(email, code);

        // Find or create user
        let user = await UserModel.findByEmail(email);

        if (!user) {
            // Create new user if doesn't exist
            if (!name) {
                throw new AppError('Name is required for new users', 400);
            }

            user = await UserModel.create({
                name,
                email,
                phone,
                provider: 'otp',
                emailVerified: true, // Email is verified via OTP
            });

            logger.info(`New user created via OTP: ${email}`);
        } else {
            // Update existing user (could be listener pre-created by admin)
            const updates = { emailVerified: true };

            // If user was pre-created by admin without name, add it
            if (!user.name && name) {
                updates.name = name;
            }
            if (!user.phone && phone) {
                updates.phone = phone;
            }
            // Set provider if not set
            if (!user.provider) {
                updates.provider = 'otp';
            }

            user = await UserModel.update(email, updates);

            // Re-fetch user if update returned null (shouldn't happen, but safety check)
            if (!user) {
                user = await UserModel.findByEmail(email);
                if (!user) {
                    throw new AppError('User not found after update', 500);
                }
            }

            // Ensure role has a default value
            if (!user.role) {
                user.role = 'client';
            }

            if (user.role === 'listener') {
                logger.info(`Listener logged in via OTP: ${email}`);
            }
        }

        // Reset login attempts
        await UserModel.resetLoginAttempts(email);

        // Ensure user has all required fields
        if (!user.role) {
            user.role = 'client';
        }

        // Generate JWT token with full user object (matching Google OAuth pattern)
        const token = generateToken({
            userId: user._id.toString(),
            email: user.email,
            name: user.name,
            phone: user.phone || '',
            role: user.role || 'client',
            emailVerified: user.emailVerified,
            provider: user.provider || 'otp',
            picture: user.picture || '',
        });

        logger.info(`User logged in via OTP: ${email}`);

        res.json({
            success: true,
            message: 'OTP verified successfully',
            data: {
                user: {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    phone: user.phone || '',
                    emailVerified: user.emailVerified,
                    role: user.role || 'client',
                    provider: user.provider || 'otp',
                    picture: user.picture || '',
                },
                token,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Verify email address with token
 */
const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.body;

        if (!token) {
            throw new AppError('Verification token is required', 400);
        }

        // Find user with this token
        const db = require('../config/database').getDB();
        const user = await db.collection('users').findOne({
            emailVerificationToken: token,
        });

        if (!user) {
            throw new AppError('Invalid or expired verification token', 400);
        }

        // Update user
        await UserModel.update(user.email, {
            emailVerified: true,
            emailVerificationToken: null,
        });

        logger.info(`Email verified: ${user.email}`);

        res.json({
            success: true,
            message: 'Email verified successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Request password reset
 */
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            throw new AppError('Email is required', 400);
        }

        const user = await UserModel.findByEmail(email);
        if (!user) {
            // Don't reveal if user exists
            res.json({
                success: true,
                message: 'If an account exists with this email, a password reset link has been sent.',
            });
            return;
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Save token
        await UserModel.update(email, {
            passwordResetToken: resetToken,
            passwordResetExpires: resetExpires,
        });

        // Send email
        try {
            await emailService.sendPasswordReset(email, resetToken);
        } catch (emailError) {
            logger.error('Failed to send password reset email:', emailError);
            throw new AppError('Failed to send password reset email', 500);
        }

        logger.info(`Password reset requested: ${email}`);

        res.json({
            success: true,
            message: 'If an account exists with this email, a password reset link has been sent.',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Reset password with token
 */
const resetPassword = async (req, res, next) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            throw new AppError('Token and new password are required', 400);
        }

        // Find user with valid token
        const db = require('../config/database').getDB();
        const user = await db.collection('users').findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: new Date() },
        });

        if (!user) {
            throw new AppError('Invalid or expired reset token', 400);
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Update user
        await UserModel.update(user.email, {
            password: hashedPassword,
            passwordResetToken: null,
            passwordResetExpires: null,
            loginAttempts: 0,
            lockUntil: null,
        });

        logger.info(`Password reset: ${user.email}`);

        res.json({
            success: true,
            message: 'Password reset successful. You can now login with your new password.',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Resend verification email
 */
const resendVerification = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            throw new AppError('Email is required', 400);
        }

        const user = await UserModel.findByEmail(email);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        if (user.emailVerified) {
            throw new AppError('Email is already verified', 400);
        }

        // Generate new token
        const emailVerificationToken = crypto.randomBytes(32).toString('hex');
        await UserModel.update(email, { emailVerificationToken });

        // Send email
        await emailService.sendEmailVerification(email, emailVerificationToken);

        res.json({
            success: true,
            message: 'Verification email sent',
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    sendOTP,
    verifyOTP,
    verifyEmail,
    forgotPassword,
    resetPassword,
    resendVerification,
};
