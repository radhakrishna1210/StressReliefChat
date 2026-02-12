/**
 * Custom Error class for operational errors
 * Operational errors are expected errors that we can handle gracefully
 */
class AppError extends Error {
    constructor(message, statusCode, isOperational = true) {
        super(message);

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = isOperational;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
