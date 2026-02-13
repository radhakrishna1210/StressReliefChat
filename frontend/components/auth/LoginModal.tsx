'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGoogle, FaTimes, FaEnvelope } from 'react-icons/fa';
import toast from 'react-hot-toast';
import OTPInput from './OTPInput';
import * as authApi from '@/lib/authApi';
import { setCurrentUser } from '@/lib/storage';
import { decodeAndStoreUserData } from '@/lib/UserData';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (user: any) => void;
}

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
    const [loading, setLoading] = useState(false);
    const [showEmailLogin, setShowEmailLogin] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleGoogleLogin = () => {
        try {
            setLoading(true);
            let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5000';
            
            // Ensure we have a proper URL
            if (!apiUrl.startsWith('http')) {
                // If it's just a hostname without domain, assume it's a Render service
                if (!apiUrl.includes('.')) {
                    apiUrl = `https://${apiUrl}.onrender.com`;
                } else {
                    apiUrl = `https://${apiUrl}`;
                }
            }

            // Redirect to backend Google OAuth endpoint
            window.location.href = `${apiUrl}/api/auth/google`;
        } catch (error) {
            toast.error('Google login failed');
            setLoading(false);
        }
    };

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSendOTP = async () => {
        if (!validateEmail(email)) {
            setErrors({ email: 'Please enter a valid email address' });
            return;
        }

        setLoading(true);
        try {
            const response = await authApi.sendOTP(email);
            if (response.success) {
                setOtpSent(true);
                toast.success('OTP sent to your email!', { icon: '📧' });
            } else {
                toast.error(response.error || 'Failed to send OTP');
            }
        } catch (error) {
            toast.error('Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (otp: string) => {
        setLoading(true);
        try {
            const response = await authApi.verifyOTP({
                email,
                code: otp,
            });

            if (response.success && response.data) {
                authApi.setAuthToken(response.data.token);
                decodeAndStoreUserData();
                await setCurrentUser(response.data.user);
                toast.success('Login successful!', { icon: '🎉' });
                if (onSuccess) {
                    onSuccess(response.data.user);
                }
                onClose();
                // Reload page to update UI with logged-in state
                window.location.reload();
            } else {
                toast.error(response.error || 'Invalid OTP');
                setErrors({ otp: response.error || 'Invalid OTP' });
            }
        } catch (error) {
            toast.error('OTP verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetEmailLogin = () => {
        setShowEmailLogin(false);
        setOtpSent(false);
        setEmail('');
        setErrors({});
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                className="glass rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3 }}
            >
                {/* Header with Gradient */}
                <div className="bg-gradient-to-r from-primary-blue to-primary-green p-6 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white">
                        Welcome Back
                    </h2>
                    <button
                        onClick={() => {
                            onClose();
                            resetEmailLogin();
                        }}
                        className="text-white/80 hover:text-white transition"
                    >
                        <FaTimes className="text-xl" />
                    </button>
                </div>

                <div className="p-8 bg-white/95">
                    <AnimatePresence mode="wait">
                        {!showEmailLogin ? (
                            <motion.div
                                key="main-options"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                {/* Welcome Message */}
                                <div className="text-center mb-8">
                                    <p className="text-gray-700 text-lg">
                                        Sign in to start your journey towards better mental wellness
                                    </p>
                                </div>

                                {/* Google Login Button */}
                                <motion.button
                                    onClick={handleGoogleLogin}
                                    disabled={loading}
                                    className="w-full py-4 px-6 bg-white border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:border-primary-blue hover:shadow-lg transition-all flex items-center justify-center gap-3 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                                    whileHover={{ scale: loading ? 1 : 1.02 }}
                                    whileTap={{ scale: loading ? 1 : 0.98 }}
                                >
                                    <FaGoogle className="text-2xl text-red-500" />
                                    {loading ? 'Redirecting...' : 'Continue with Google'}
                                </motion.button>

                                {/* Divider */}
                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-200"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-3 bg-white text-gray-500 font-medium">Or</span>
                                    </div>
                                </div>

                                {/* Email Login Button */}
                                <motion.button
                                    onClick={() => setShowEmailLogin(true)}
                                    className="w-full py-4 px-6 bg-gradient-to-r from-primary-blue to-primary-green text-white rounded-xl font-semibold hover:shadow-xl transition-all flex items-center justify-center gap-3"
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <FaEnvelope className="text-xl" />
                                    Continue with Email
                                </motion.button>

                                {/* Privacy Notice */}
                                <p className="text-xs text-gray-500 text-center mt-6">
                                    By continuing, you agree to our Terms of Service and Privacy Policy
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="email-login"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                {/* Back Button */}
                                <button
                                    onClick={resetEmailLogin}
                                    className="text-primary-blue hover:text-primary-green transition-colors mb-4 flex items-center gap-2 font-medium"
                                >
                                    ← Back to login options
                                </button>

                                {!otpSent ? (
                                    <>
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                                            Sign in with Email
                                        </h3>
                                        <p className="text-gray-600 mb-6">
                                            We'll send you a one-time password to verify your email
                                        </p>

                                        {/* Email Input */}
                                        <div className="mb-6">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                <FaEnvelope className="inline mr-1" /> Email Address
                                            </label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => {
                                                    setEmail(e.target.value);
                                                    setErrors({});
                                                }}
                                                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition ${errors.email ? 'border-red-500' : 'border-gray-200 focus:border-primary-blue'
                                                    }`}
                                                placeholder="your@email.com"
                                            />
                                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                        </div>

                                        {/* Send OTP Button */}
                                        <motion.button
                                            onClick={handleSendOTP}
                                            disabled={loading}
                                            className="w-full py-4 bg-gradient-to-r from-primary-blue to-primary-green text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            whileHover={{ scale: loading ? 1 : 1.02, y: loading ? 0 : -2 }}
                                            whileTap={{ scale: loading ? 1 : 0.98 }}
                                        >
                                            {loading ? 'Sending...' : 'Send OTP'}
                                        </motion.button>
                                    </>
                                ) : (
                                    <>
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                                            Enter OTP
                                        </h3>
                                        <p className="text-sm text-gray-600 text-center mb-6">
                                            Enter the 6-digit code sent to <strong className="text-primary-blue">{email}</strong>
                                        </p>
                                        <OTPInput
                                            onComplete={handleVerifyOTP}
                                            onResend={handleSendOTP}
                                            loading={loading}
                                            error={errors.otp}
                                        />
                                        <button
                                            onClick={() => setOtpSent(false)}
                                            className="text-sm text-gray-600 hover:text-primary-blue transition-colors w-full text-center mt-4"
                                        >
                                            Change email
                                        </button>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
