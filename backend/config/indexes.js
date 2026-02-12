const { getDB } = require('./database');
const logger = require('../utils/logger');

/**
 * Create database indexes for better query performance
 */
const createIndexes = async () => {
    try {
        const db = getDB();

        // Users collection indexes
        await db.collection('users').createIndex(
            { email: 1 },
            { unique: true, name: 'email_unique' }
        );

        await db.collection('users').createIndex(
            { phone: 1 },
            { sparse: true, name: 'phone_index' }
        );

        await db.collection('users').createIndex(
            { createdAt: -1 },
            { name: 'created_at_index' }
        );

        // Transactions collection indexes
        await db.collection('transactions').createIndex(
            { email: 1, createdAt: -1 },
            { name: 'email_created_index' }
        );

        await db.collection('transactions').createIndex(
            { type: 1 },
            { name: 'type_index' }
        );

        await db.collection('transactions').createIndex(
            { createdAt: -1 },
            { name: 'transaction_created_index' }
        );

        // Previous calls collection indexes
        await db.collection('previousCalls').createIndex(
            { email: 1, date: -1 },
            { name: 'email_date_index' }
        );

        // Favorites collection indexes
        await db.collection('favorites').createIndex(
            { email: 1 },
            { unique: true, name: 'email_favorites_unique' }
        );

        logger.info('✅ Database indexes created successfully');
    } catch (error) {
        logger.error('Error creating database indexes:', error);
        throw error;
    }
};

module.exports = { createIndexes };
