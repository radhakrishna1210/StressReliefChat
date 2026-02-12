const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

/**
 * General API rate limiter
 * Limits to 100 requests per 15 minutes
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            success: false,
            message: 'Too many requests, please try again later.',
        });
    },
});

/**
 * Strict rate limiter for authentication endpoints
 * Limits to 20 requests per 15 minutes (increased for development)
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Increased from 5 to 20 for development
    message: 'Too many login attempts, please try again later.',
    skipSuccessfulRequests: true, // Don't count successful requests
    handler: (req, res) => {
        logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            success: false,
            message: 'Too many login attempts. Please try again in 15 minutes.',
        });
    },
});

/**
 * Payment endpoint rate limiter
 * More restrictive to prevent abuse
 */
const paymentLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit to 10 payment attempts per hour
    message: 'Too many payment attempts, please try again later.',
    handler: (req, res) => {
        logger.warn(`Payment rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            success: false,
            message: 'Too many payment attempts. Please try again later.',
        });
    },
});

/**
 * OTP request rate limiter
 * Limits to 10 OTP requests per 15 minutes (increased for development)
 */
const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Increased from 3 to 10 for development
    message: {
        success: false,
        error: 'Too many OTP requests. Please try again in 15 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`OTP rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            success: false,
            error: 'Too many OTP requests. Please try again in 15 minutes.',
        });
    },
});

/**
 * Registration rate limiter
 * Limits to 3 registrations per hour
 */
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 requests per windowMs
    message: {
        success: false,
        error: 'Too many registration attempts. Please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`Registration rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            success: false,
            error: 'Too many registration attempts. Please try again later.',
        });
    },
});

module.exports = {
    apiLimiter,
    authLimiter,
    paymentLimiter,
    otpLimiter,
    registerLimiter,
    loginLimiter: authLimiter, // Alias for consistency
};
