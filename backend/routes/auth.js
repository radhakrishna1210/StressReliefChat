const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const googleAuthController = require('../controllers/googleAuthController');
const { loginLimiter, otpLimiter, registerLimiter } = require('../middleware/rateLimiter');

// Google OAuth
router.get('/google', googleAuthController.initiateGoogleAuth);
router.get('/google/callback', googleAuthController.handleGoogleCallback);

// Registration
router.post('/register', registerLimiter, authController.register);

// Login with password
router.post('/login', loginLimiter, authController.login);

// OTP-based authentication
router.post('/send-otp', otpLimiter, authController.sendOTP);
router.post('/verify-otp', loginLimiter, authController.verifyOTP);

// Email verification
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', otpLimiter, authController.resendVerification);

// Password reset
router.post('/forgot-password', otpLimiter, authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
