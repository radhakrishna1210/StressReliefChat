'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FaCheck, FaTimes } from 'react-icons/fa';

interface PasswordStrengthIndicatorProps {
    password: string;
}

interface Requirement {
    label: string;
    met: boolean;
}

export default function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
    const requirements: Requirement[] = useMemo(() => [
        { label: 'At least 8 characters', met: password.length >= 8 },
        { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
        { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
        { label: 'Contains number', met: /\d/.test(password) },
        { label: 'Contains special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    ], [password]);

    const strength = useMemo(() => {
        const metCount = requirements.filter((req) => req.met).length;
        if (metCount === 0) return { level: 0, label: '', color: '' };
        if (metCount <= 2) return { level: 1, label: 'Weak', color: 'bg-red-500' };
        if (metCount <= 3) return { level: 2, label: 'Fair', color: 'bg-orange-500' };
        if (metCount <= 4) return { level: 3, label: 'Good', color: 'bg-yellow-500' };
        return { level: 4, label: 'Strong', color: 'bg-green-500' };
    }, [requirements]);

    if (!password) return null;

    return (
        <div className="space-y-3">
            {/* Strength Bar */}
            <div className="space-y-1">
                <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Password Strength</span>
                    {strength.label && (
                        <span className={`text-xs font-semibold ${strength.level === 1 ? 'text-red-500' :
                                strength.level === 2 ? 'text-orange-500' :
                                    strength.level === 3 ? 'text-yellow-600' :
                                        'text-green-500'
                            }`}>
                            {strength.label}
                        </span>
                    )}
                </div>
                <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                        <motion.div
                            key={level}
                            className={`h-2 flex-1 rounded-full ${level <= strength.level ? strength.color : 'bg-gray-200'
                                }`}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: level <= strength.level ? 1 : 1 }}
                            transition={{ duration: 0.3, delay: level * 0.05 }}
                        />
                    ))}
                </div>
            </div>

            {/* Requirements Checklist */}
            <div className="space-y-1">
                {requirements.map((req, index) => (
                    <motion.div
                        key={index}
                        className="flex items-center gap-2 text-xs"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        {req.met ? (
                            <FaCheck className="text-green-500 text-xs" />
                        ) : (
                            <FaTimes className="text-gray-300 text-xs" />
                        )}
                        <span className={req.met ? 'text-green-600' : 'text-gray-500'}>
                            {req.label}
                        </span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
