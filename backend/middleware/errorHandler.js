const logger = require('../utils/logger');
const AppError = require('../utils/AppError');

/**
 * Enhanced error handling middleware
 * Handles all errors and sends appropriate responses
 */
const errorHandler = (err, req, res, next) => {
  // Default to 500 server error
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;
  error.status = err.status || 'error';

  // Log error
  if (error.statusCode >= 500) {
    logger.error('Server Error:', {
      message: error.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
    });
  } else {
    logger.warn('Client Error:', {
      message: error.message,
      statusCode: error.statusCode,
      url: req.originalUrl,
    });
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    error = new AppError(`${field} already exists`, 400);
  }

  // MongoDB validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    error = new AppError(`Validation Error: ${errors.join(', ')}`, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token expired', 401);
  }

  // Send response
  res.status(error.statusCode).json({
    success: false,
    status: error.status,
    message: error.message,
    // Include validation errors if present
    ...(error.errors && { errors: error.errors }),
    // Include stack trace only in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Handle 404 errors for unknown routes
 */
const notFound = (req, res, next) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

module.exports = errorHandler;
module.exports.notFound = notFound;




