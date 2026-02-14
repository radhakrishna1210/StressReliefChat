require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const helmet = require('helmet');
const passport = require('passport');
const { connectDB } = require('./config/database');
const cors = require('./middleware/cors');
const { notFound } = require('./middleware/errorHandler');
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');
const { sanitizeInput } = require('./middleware/validator');
const { apiLimiter } = require('./middleware/rateLimiter');
const logger = require('./utils/logger');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/auth');
const healthRoutes = require('./routes/healthRoutes');
const SignalingServer = require('./services/signalingServer');
const MatchmakingService = require('./services/MatchmakingService');

// Note: Google OAuth controller will be initialized after DB connection

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Trust proxy is required when running behind a load balancer (like Render, Heroku, Nginx)
// This allows express-rate-limit to correctly identify users via X-Forwarded-For header
app.set('trust proxy', 1);

// Initialize Socket.IO with CORS
const io = new Server(httpServer, {
    cors: {
        // For LAN testing, allow any http://<ip>:3000 in development.
        // In production, keep it strict via FRONTEND_URL.
        origin:
            process.env.NODE_ENV === 'production'
                ? (process.env.FRONTEND_URL || 'http://localhost:3000').split(',').map((s) => {
                    const url = s.trim();
                    return url.startsWith('http') ? url : `https://${url}`;
                })
                : (origin, callback) => {
                    if (!origin) return callback(null, true);
                    if (origin === 'http://localhost:3000' || origin === 'http://127.0.0.1:3000') return callback(null, true);
                    if (/^http:\/\/\d{1,3}(\.\d{1,3}){3}:3000$/.test(origin)) return callback(null, true);

                    // Allow HTTPS tunnel services (ngrok, cloudflare, VS Code tunnels, localtunnel, etc.)
                    if (/^https:\/\/.*\.(ngrok-free\.app|ngrok\.io|trycloudflare\.com|loca\.lt|devtunnels\.ms)$/i.test(origin)) {
                        return callback(null, true);
                    }

                    return callback(new Error(`Socket.IO CORS blocked origin: ${origin}`), false);
                },
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Initialize Matchmaking Service
const matchmakingService = new MatchmakingService(io);

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
    },
}));

// CORS - must be before other middleware
app.use(cors);

// Request logging
app.use(requestLogger);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize Passport
app.use(passport.initialize());

// Input sanitization
app.use(sanitizeInput);

// Health check routes (no rate limiting)
app.use('/health', healthRoutes);

// Google OAuth routes (exempt from rate limiting for smooth OAuth flow)
app.use('/api/auth/google', authRoutes);

// Rate limiting for all other API routes
app.use('/api', apiLimiter);

// Other API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/therapists', require('./routes/therapistRoutes'));

// 404 handler for unknown routes
app.use(notFound);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
    try {
        // Connect to database FIRST
        await connectDB();
        logger.info('✅ Database connected successfully');

        // Initialize Google OAuth controller AFTER database is connected
        require('./controllers/googleAuthController');
        logger.info('✅ Google OAuth initialized');

        // Initialize WebRTC signaling server
        const signalingServer = new SignalingServer(io, matchmakingService);
        signalingServer.initialize();

        // Start listening
        httpServer.listen(PORT, () => {
            logger.info(`🚀 Backend server running on http://localhost:${PORT}`);
            logger.info(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
            logger.info(`🔒 Security middleware enabled`);
            logger.info(`📞 WebRTC signaling server ready`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    const { closeDB } = require('./config/database');
    await closeDB();
    process.exit(0);
});

process.on('SIGINT', async () => {
    logger.info('SIGINT signal received: closing HTTP server');
    const { closeDB } = require('./config/database');
    await closeDB();
    process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

startServer();

