const express = require('express');
const { getDB } = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * Basic health check
 * GET /health
 */
router.get('/', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
    });
});

/**
 * Detailed health check with database status
 * GET /health/detailed
 */
router.get('/detailed', async (req, res) => {
    try {
        const db = getDB();

        // Check database connection
        await db.admin().ping();

        // Get database stats
        const stats = await db.stats();

        res.json({
            success: true,
            status: 'healthy',
            timestamp: new Date().toISOString(),
            server: {
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                environment: process.env.NODE_ENV || 'development',
                nodeVersion: process.version,
            },
            database: {
                connected: true,
                size: stats.dataSize,
                collections: stats.collections,
            },
        });
    } catch (error) {
        logger.error('Health check failed:', error);
        res.status(503).json({
            success: false,
            status: 'unhealthy',
            message: 'Database connection failed',
            timestamp: new Date().toISOString(),
        });
    }
});

/**
 * Readiness check (for Kubernetes/container orchestration)
 * GET /health/ready
 */
router.get('/ready', async (req, res) => {
    try {
        const db = getDB();
        await db.admin().ping();

        res.status(200).json({
            success: true,
            ready: true,
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            ready: false,
            message: 'Service not ready',
        });
    }
});

/**
 * Liveness check (for Kubernetes/container orchestration)
 * GET /health/live
 */
router.get('/live', (req, res) => {
    res.status(200).json({
        success: true,
        alive: true,
    });
});

module.exports = router;
