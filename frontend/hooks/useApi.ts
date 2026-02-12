import { useState, useCallback } from 'react';
import { handleAPIError, logError } from './errorHandler';

interface UseApiOptions {
    onSuccess?: (data: any) => void;
    onError?: (error: string) => void;
}

interface UseApiReturn<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    execute: (...args: any[]) => Promise<void>;
    reset: () => void;
}

/**
 * Custom hook for API calls with built-in loading, error states, and error handling
 */
export function useApi<T = any>(
    apiFunction: (...args: any[]) => Promise<T>,
    options: UseApiOptions = {}
): UseApiReturn<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const execute = useCallback(
        async (...args: any[]) => {
            try {
                setLoading(true);
                setError(null);

                const result = await apiFunction(...args);
                setData(result);

                if (options.onSuccess) {
                    options.onSuccess(result);
                }
            } catch (err) {
                const errorMessage = handleAPIError(err);
                setError(errorMessage);
                logError(err as Error, { apiFunction: apiFunction.name, args });

                if (options.onError) {
                    options.onError(errorMessage);
                }
            } finally {
                setLoading(false);
            }
        },
        [apiFunction, options]
    );

    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setLoading(false);
    }, []);

    return {
        data,
        loading,
        error,
        execute,
        reset,
    };
}
