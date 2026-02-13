const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const UserModel = require('../models/User');
const { generateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

// Google OAuth Strategy Configuration
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.BACKEND_URL
                ? `${process.env.BACKEND_URL}/api/auth/google/callback`
                : `${process.env.FRONTEND_URL || 'http://localhost:3000'}/api/auth/google/callback`.replace(':3000', ':5000'),
            proxy: true,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Extract user info from Google profile
                const email = profile.emails?.[0]?.value;
                const name = profile.displayName;
                const picture = profile.photos?.[0]?.value;

                if (!email) {
                    return done(new Error('No email found in Google profile'), null);
                }

                // Find or create user
                let user = await UserModel.findByEmail(email);

                if (!user) {
                    // Create new user
                    user = await UserModel.create({
                        name,
                        email,
                        provider: 'google',
                        picture,
                        emailVerified: true, // Google emails are pre-verified
                    });
                    logger.info(`New user created via Google OAuth: ${email}`);
                } else {
                    // Update existing user with Google info (merge accounts)
                    const updates = {
                        emailVerified: true, // Google emails are verified
                    };

                    // Update provider only if it was OTP or not set
                    if (!user.provider || user.provider === 'otp') {
                        updates.provider = 'google';
                    }

                    // Update picture if not set or if logging in with Google
                    if (!user.picture || user.provider === 'google') {
                        updates.picture = picture;
                    }

                    // Update name if not set
                    if (!user.name || user.name === email) {
                        updates.name = name;
                    }

                    await UserModel.update(email, updates);

                    // Refresh user object with updates
                    user = { ...user, ...updates };

                    logger.info(`User logged in via Google OAuth (account merged): ${email}`);
                }

                return done(null, user);
            } catch (error) {
                logger.error('Google OAuth error:', error);
                return done(error, null);
            }
        }
    )
);

/**
 * Initiate Google OAuth flow
 */
const initiateGoogleAuth = passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
});

/**
 * Handle Google OAuth callback
 */
const handleGoogleCallback = (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user, info) => {
        try {
            if (err || !user) {
                logger.error('Google OAuth callback error:', err || 'No user returned');
                // Redirect to frontend with error
                const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
                return res.redirect(`${frontendUrl}?error=google_auth_failed`);
            }

            // Generate JWT token with full user object
            const token = generateToken({
                userId: user._id.toString(),
                email: user.email,
                name: user.name,
                phone: user.phone || '',
                role: user.role,
                emailVerified: user.emailVerified,
                provider: user.provider,
                picture: user.picture,
            });

            // Redirect to frontend callback page with token
            const callbackUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/google/callback`;
            res.redirect(`${callbackUrl}?token=${token}`);
        } catch (error) {
            logger.error('Error generating token in Google callback:', error);
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            res.redirect(`${frontendUrl}?error=token_generation_failed`);
        }
    })(req, res, next);
};

module.exports = {
    initiateGoogleAuth,
    handleGoogleCallback,
};
