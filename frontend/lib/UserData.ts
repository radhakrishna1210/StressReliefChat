import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    userId: string;
    email: string;
    name: string;
    phone?: string;
    role?: string;
    emailVerified?: boolean;
    provider?: string;
    picture?: string;
    exp?: number;
    iat?: number;
}

/**
 * Decode JWT token and store user data in localStorage
 * This utility ensures consistent token handling across all auth flows
 */
export function decodeAndStoreUserData(): boolean {
    try {
        // Get token from localStorage
        const token = localStorage.getItem('authToken');

        if (!token) {
            console.warn('No auth token found');
            clearAuthData();
            return false;
        }

        // Decode JWT
        const decoded = jwtDecode<DecodedToken>(token);

        // Check if token is expired
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
            console.warn('Token has expired');
            clearAuthData();
            return false;
        }

        // Normalize and store user data
        const userData = {
            id: decoded.userId,
            email: decoded.email,
            name: decoded.name,
            phone: decoded.phone || '',
            role: decoded.role || 'user',
            emailVerified: decoded.emailVerified || false,
            provider: decoded.provider || 'local',
            picture: decoded.picture || '',
        };

        // Store normalized user data
        localStorage.setItem('userData', JSON.stringify(userData));

        console.log('User data decoded and stored successfully');
        return true;
    } catch (error) {
        console.error('Error decoding token:', error);
        clearAuthData();
        return false;
    }
}

/**
 * Clear all authentication data from storage
 */
export function clearAuthData(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    sessionStorage.removeItem('currentUser');
}

/**
 * Get stored user data
 */
export function getUserData(): DecodedToken | null {
    try {
        const userData = localStorage.getItem('userData');
        if (!userData) return null;
        return JSON.parse(userData);
    } catch {
        return null;
    }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    return !!(token && userData);
}
