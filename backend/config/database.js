const { MongoClient } = require('mongodb');
const logger = require('../utils/logger');

let client;
let db;

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // MongoDB connection options
    const options = {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    client = new MongoClient(process.env.MONGODB_URI, options);
    await client.connect();
    db = client.db('stressrelief');

    logger.info('✅ MongoDB connected successfully');

    // Create indexes after connection
    const { createIndexes } = require('./indexes');
    await createIndexes();

    return db;
  } catch (error) {
    logger.error('❌ MongoDB connection error:', error.message || error);
    logger.warn('⚠️  Server will continue without database connection');
    logger.warn('⚠️  WebRTC and other features will work, but data persistence is disabled');
    return null; // Return null instead of exiting
  }
};

const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB() first.');
  }
  return db;
};

const closeDB = async () => {
  if (client) {
    await client.close();
    logger.info('MongoDB connection closed');
  }
};

module.exports = { connectDB, getDB, closeDB };




