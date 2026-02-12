require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const helmet = require('helmet');
const cors = require('./middleware/cors');
const { notFound } = require('./middleware/errorHandler');
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');
const logger = require('./utils/logger');
const SignalingServer = require('./services/signalingServer');
const MatchmakingService = require('./services/MatchmakingService');

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize Socket.IO with CORS
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Initialize Matchmaking Service
const matchmakingService = new MatchmakingService();

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: false, // Disable for WebRTC testing
}));

// CORS
app.use(cors);

// Request logging
app.use(requestLogger);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'WebRTC server running', timestamp: new Date().toISOString() });
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
    try {
        // Initialize WebRTC signaling server with matchmaking
        const signalingServer = new SignalingServer(io, matchmakingService);
        signalingServer.initialize();

        // Start listening
        httpServer.listen(PORT, () => {
            logger.info(`🚀 WebRTC Backend server running on http://localhost:${PORT}`);
            logger.info(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
            logger.info(`📞 WebRTC signaling server ready`);
            logger.info(`🎲 Matchmaking service ready`);
            logger.info(`⚠️  Running in WebRTC-only mode (no database)`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    process.exit(0);
});

process.on('SIGINT', async () => {
    logger.info('SIGINT signal received: closing HTTP server');
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
