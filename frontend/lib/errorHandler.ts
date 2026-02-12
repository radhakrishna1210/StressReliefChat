/**
 * Centralized error handling utilities for frontend
 */

export class APIError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'APIError';
    }
}

/**
 * Handle API errors and return user-friendly messages
 */
export const handleAPIError = (error: any): string => {
    // Network errors
    if (!error.response) {
        return 'Network error. Please check your internet connection.';
    }

    // API errors
    const { status, data } = error.response;

    switch (status) {
        case 400:
            return data?.message || 'Invalid request. Please check your input.';
        case 401:
            return 'Session expired. Please login again.';
        case 403:
            return 'Access denied. You don\'t have permission to perform this action.';
        case 404:
            return 'Resource not found.';
        case 429:
            return 'Too many requests. Please try again later.';
        case 500:
            return 'Server error. Please try again later.';
        case 503:
            return 'Service temporarily unavailable. Please try again later.';
        default:
            return data?.message || 'An unexpected error occurred.';
    }
};

/**
 * Log error to console in development and error tracking service in production
 */
export const logError = (error: Error, context?: Record<string, any>) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', error);
        if (context) {
            console.error('Context:', context);
        }
    }

    // TODO: Send to error tracking service (e.g., Sentry) in production
    // if (process.env.NODE_ENV === 'production') {
    //   Sentry.captureException(error, { extra: context });
    // }
};

/**
 * Create a safe error message for display to users
 * Strips sensitive information
 */
export const createSafeErrorMessage = (error: any): string => {
    if (error instanceof APIError) {
        return error.message;
    }

    if (error instanceof Error) {
        // Don't expose internal error messages in production
        if (process.env.NODE_ENV === 'production') {
            return 'An error occurred. Please try again.';
        }
        return error.message;
    }

    return 'An unexpected error occurred.';
};

/**
 * Async error wrapper for better error handling
 */
export const asyncHandler = <T>(
    fn: (...args: any[]) => Promise<T>
) => {
    return async (...args: any[]): Promise<T> => {
        try {
            return await fn(...args);
        } catch (error) {
            logError(error as Error, { function: fn.name, args });
            throw error;
        }
    };
};
