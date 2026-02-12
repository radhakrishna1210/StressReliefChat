const { body, param, query, validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

/**
 * Validation middleware to check for validation errors
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => ({
            field: err.param,
            message: err.msg,
        }));

        return next(new AppError('Validation failed', 400, true, errorMessages));
    }

    next();
};

/**
 * Validation rules for user creation/update
 */
const userValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
    body('phone')
        .optional()
        .trim()
        .matches(/^[0-9]{10}$/)
        .withMessage('Phone number must be 10 digits'),
    validate,
];

/**
 * Validation rules for wallet operations
 */
const walletValidation = [
    body('amount')
        .isFloat({ min: 0.01 })
        .withMessage('Amount must be a positive number'),
    body('type')
        .optional()
        .isIn(['credit', 'debit'])
        .withMessage('Type must be either credit or debit'),
    validate,
];

/**
 * Validation rules for transactions
 */
const transactionValidation = [
    body('amount')
        .isFloat({ min: 0.01 })
        .withMessage('Amount must be a positive number'),
    body('type')
        .isIn(['payment', 'refund', 'wallet_credit', 'wallet_debit'])
        .withMessage('Invalid transaction type'),
    body('description')
        .trim()
        .isLength({ min: 1, max: 500 })
        .withMessage('Description is required and must be less than 500 characters'),
    validate,
];

/**
 * Validation rules for email parameter
 */
const emailParamValidation = [
    param('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    validate,
];

/**
 * Sanitize user input to prevent XSS and injection attacks
 */
const sanitizeInput = (req, res, next) => {
    // Remove any HTML tags from string inputs
    const sanitizeString = (str) => {
        if (typeof str !== 'string') return str;
        return str.replace(/<[^>]*>/g, '').trim();
    };

    // Sanitize body
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = sanitizeString(req.body[key]);
            }
        });
    }

    // Sanitize query parameters
    if (req.query) {
        Object.keys(req.query).forEach(key => {
            if (typeof req.query[key] === 'string') {
                req.query[key] = sanitizeString(req.query[key]);
            }
        });
    }

    next();
};

module.exports = {
    validate,
    userValidation,
    walletValidation,
    transactionValidation,
    emailParamValidation,
    sanitizeInput,
};
