'use client';

import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react';
import { motion } from 'framer-motion';

interface OTPInputProps {
    length?: number;
    onComplete: (otp: string) => void;
    onResend?: () => void;
    loading?: boolean;
    error?: string;
}

export default function OTPInput({
    length = 6,
    onComplete,
    onResend,
    loading = false,
    error,
}: OTPInputProps) {
    const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
    const [resendCountdown, setResendCountdown] = useState(0);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Start countdown when component mounts
    useEffect(() => {
        setResendCountdown(60);
    }, []);

    // Countdown timer
    useEffect(() => {
        if (resendCountdown > 0) {
            const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCountdown]);

    const handleChange = (index: number, value: string) => {
        // Only allow numbers
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }

        // Check if OTP is complete
        if (newOtp.every((digit) => digit !== '')) {
            onComplete(newOtp.join(''));
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
            if (!otp[index] && index > 0) {
                // Move to previous input if current is empty
                inputRefs.current[index - 1]?.focus();
            } else {
                // Clear current input
                const newOtp = [...otp];
                newOtp[index] = '';
                setOtp(newOtp);
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text/plain').slice(0, length);

        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = [...otp];
        for (let i = 0; i < pastedData.length; i++) {
            newOtp[i] = pastedData[i];
        }
        setOtp(newOtp);

        // Focus last filled input or next empty
        const nextIndex = Math.min(pastedData.length, length - 1);
        inputRefs.current[nextIndex]?.focus();

        // Check if complete
        if (newOtp.every((digit) => digit !== '')) {
            onComplete(newOtp.join(''));
        }
    };

    const handleResend = () => {
        if (resendCountdown === 0 && onResend) {
            onResend();
            setResendCountdown(60);
            setOtp(new Array(length).fill(''));
            inputRefs.current[0]?.focus();
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-2 justify-center">
                {otp.map((digit, index) => (
                    <motion.input
                        key={index}
                        ref={(el) => {
                            inputRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        disabled={loading}
                        className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl focus:outline-none transition-all ${error
                                ? 'border-red-500 bg-red-50'
                                : digit
                                    ? 'border-primary-blue bg-blue-50'
                                    : 'border-gray-300 bg-white'
                            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        autoFocus={index === 0}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                    />
                ))}
            </div>

            {error && (
                <motion.p
                    className="text-red-500 text-sm text-center"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {error}
                </motion.p>
            )}

            {onResend && (
                <div className="text-center">
                    {resendCountdown > 0 ? (
                        <p className="text-sm text-gray-600">
                            Resend code in <span className="font-semibold">{resendCountdown}s</span>
                        </p>
                    ) : (
                        <motion.button
                            type="button"
                            onClick={handleResend}
                            className="text-sm text-primary-blue font-semibold hover:underline"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Resend Code
                        </motion.button>
                    )}
                </div>
            )}
        </div>
    );
}
