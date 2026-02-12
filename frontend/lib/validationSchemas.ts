import { z } from 'zod';

/**
 * User login validation schema
 */
export const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address'),
    phone: z
        .string()
        .optional()
        .refine(
            (val) => !val || /^[0-9]{10}$/.test(val),
            'Phone number must be 10 digits'
        ),
});

/**
 * Payment form validation schema
 */
export const paymentSchema = z.object({
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be less than 100 characters'),
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address'),
    phone: z
        .string()
        .regex(/^[0-9]{10}$/, 'Phone number must be 10 digits'),
    duration: z
        .number()
        .min(15, 'Minimum duration is 15 minutes')
        .max(120, 'Maximum duration is 120 minutes'),
    paymentMethod: z.enum(['upi', 'card', 'applepay', 'googlepay'], {
        required_error: 'Please select a payment method',
    }),
});

/**
 * User profile update schema
 */
export const profileSchema = z.object({
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be less than 100 characters')
        .optional(),
    phone: z
        .string()
        .regex(/^[0-9]{10}$/, 'Phone number must be 10 digits')
        .optional(),
    email: z
        .string()
        .email('Please enter a valid email address'),
});

/**
 * Wallet top-up validation schema
 */
export const walletTopUpSchema = z.object({
    amount: z
        .number()
        .min(100, 'Minimum top-up amount is ₹100')
        .max(10000, 'Maximum top-up amount is ₹10,000'),
    paymentMethod: z.enum(['upi', 'card', 'applepay', 'googlepay'], {
        required_error: 'Please select a payment method',
    }),
});

/**
 * Feedback/Rating schema
 */
export const feedbackSchema = z.object({
    rating: z
        .number()
        .min(1, 'Please provide a rating')
        .max(5, 'Rating must be between 1 and 5'),
    comment: z
        .string()
        .min(10, 'Feedback must be at least 10 characters')
        .max(500, 'Feedback must be less than 500 characters')
        .optional(),
});

// Type exports for TypeScript
export type LoginFormData = z.infer<typeof loginSchema>;
export type PaymentFormData = z.infer<typeof paymentSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type WalletTopUpFormData = z.infer<typeof walletTopUpSchema>;
export type FeedbackFormData = z.infer<typeof feedbackSchema>;
