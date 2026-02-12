const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

// Secret key for JWT (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate JWT token
 */
const generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
};

/**
 * Verify JWT token
 */
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new AppError('Invalid or expired token', 401);
    }
};

/**
 * Authentication middleware
 * Protects routes by requiring a valid JWT token
 */
const authenticate = (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('No token provided. Please login to access this resource.', 401);
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = verifyToken(token);

        // Attach user info to request
        req.user = decoded;

        logger.info(`User authenticated: ${decoded.email || decoded.userId}`);
        next();
    } catch (error) {
        if (error instanceof AppError) {
            next(error);
        } else {
            next(new AppError('Authentication failed', 401));
        }
    }
};

/**
 * Optional authentication middleware
 * Does not block request if no token, but attaches user if token is valid
 */
const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = verifyToken(token);
            req.user = decoded;
        }

        next();
    } catch (error) {
        // Silently fail for optional auth
        next();
    }
};

module.exports = {
    authenticate,
    optionalAuth,
    generateToken,
    verifyToken,
};
