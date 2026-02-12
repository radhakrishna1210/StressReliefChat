const logger = require('../utils/logger');

/**
 * Request logging middleware
 * Logs all incoming requests with method, URL, IP, and response time
 */
const requestLogger = (req, res, next) => {
    const startTime = Date.now();

    // Log when response is finished
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const logData = {
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('user-agent'),
        };

        // Log based on status code
        if (res.statusCode >= 500) {
            logger.error('Request failed', logData);
        } else if (res.statusCode >= 400) {
            logger.warn('Client error', logData);
        } else {
            logger.http('Request completed', logData);
        }
    });

    next();
};

module.exports = requestLogger;
