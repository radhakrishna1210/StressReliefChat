import { User } from './storage';

const getApiUrl = () => {
    const url = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5000';
    return url.startsWith('http') ? url : `https://${url}`;
}

const API_URL = getApiUrl();

export interface AuthResponse {
    success: boolean;
    message: string;
    data?: {
        user: User;
        token: string;
    };
    error?: string;
}

export interface OTPResponse {
    success: boolean;
    message: string;
    data?: {
        expiresIn: number;
    };
    error?: string;
}

/**
 * Register new user with email and password
 */
export async function register(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
}): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    return await response.json();
}

/**
 * Login with email and password
 */
export async function login(data: {
    email: string;
    password: string;
}): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    return await response.json();
}

/**
 * Send OTP to email
 */
export async function sendOTP(email: string): Promise<OTPResponse> {
    const response = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    });

    return await response.json();
}

/**
 * Verify OTP and login/register
 */
export async function verifyOTP(data: {
    email: string;
    code: string;
    name?: string;
    phone?: string;
}): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    return await response.json();
}

/**
 * Verify email with token
 */
export async function verifyEmail(token: string): Promise<{ success: boolean; message: string; error?: string }> {
    const response = await fetch(`${API_URL}/api/auth/verify-email`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
    });

    return await response.json();
}

/**
 * Resend verification email
 */
export async function resendVerification(email: string): Promise<{ success: boolean; message: string; error?: string }> {
    const response = await fetch(`${API_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    });

    return await response.json();
}

/**
 * Request password reset
 */
export async function forgotPassword(email: string): Promise<{ success: boolean; message: string; error?: string }> {
    const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    });

    return await response.json();
}

/**
 * Reset password with token
 */
export async function resetPassword(data: {
    token: string;
    password: string;
}): Promise<{ success: boolean; message: string; error?: string }> {
    const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    return await response.json();
}

/**
 * Store auth token
 */
export function setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', token);
    }
}

/**
 * Get auth token
 */
export function getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('authToken');
    }
    return null;
}

/**
 * Remove auth token
 */
export function removeAuthToken(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
    }
}

/**
 * Get authorization header
 */
export function getAuthHeader(): { Authorization: string } | {} {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}
