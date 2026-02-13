'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { decodeAndStoreUserData } from '@/lib/UserData';
import { setCurrentUser } from '@/lib/storage';

function GoogleAuthCallbackInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
    const [message, setMessage] = useState('Processing authentication...');

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Get token from URL query params
                const token = searchParams.get('token');
                const error = searchParams.get('error');

                if (error) {
                    setStatus('error');
                    setMessage('Authentication failed. Please try again.');
                    setTimeout(() => router.push('/'), 3000);
                    return;
                }

                if (!token) {
                    setStatus('error');
                    setMessage('No authentication token received.');
                    setTimeout(() => router.push('/'), 3000);
                    return;
                }

                // Store token in localStorage
                localStorage.setItem('authToken', token);

                // Decode JWT and store user data
                const success = decodeAndStoreUserData();

                if (!success) {
                    setStatus('error');
                    setMessage('Failed to process user data.');
                    setTimeout(() => router.push('/'), 3000);
                    return;
                }

                // Get user data and set current user
                const userData = localStorage.getItem('userData');
                if (userData) {
                    const user = JSON.parse(userData);
                    await setCurrentUser({
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                        provider: user.provider,
                        picture: user.picture,
                        role: user.role,
                    });
                }

                // Success!
                setStatus('success');
                setMessage('Login successful! Redirecting...');

                // Redirect to dashboard
                setTimeout(() => router.push('/dashboard'), 1500);
            } catch (error) {
                console.error('Error in Google auth callback:', error);
                setStatus('error');
                setMessage('An unexpected error occurred.');
                setTimeout(() => router.push('/'), 3000);
            }
        };

        handleCallback();
    }, [searchParams, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-blue/10 via-white to-primary-green/10">
            <motion.div
                className="glass rounded-2xl shadow-glass p-12 max-w-md w-full text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                {status === 'processing' && (
                    <>
                        <FaSpinner className="text-6xl text-primary-blue mx-auto mb-6 animate-spin" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Authenticating...
                        </h2>
                        <p className="text-gray-600">{message}</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Success!
                        </h2>
                        <p className="text-gray-600">{message}</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <FaTimesCircle className="text-6xl text-red-500 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Authentication Failed
                        </h2>
                        <p className="text-gray-600">{message}</p>
                    </>
                )}
            </motion.div>
        </div>
    );
}

export default function GoogleAuthCallback() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <GoogleAuthCallbackInner />
        </Suspense>
    );
}
