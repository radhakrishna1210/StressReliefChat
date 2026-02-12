const { getDB } = require('../config/database');

/**
 * OTP Schema:
 * {
 *   email: String (required),
 *   code: String (hashed, required),
 *   attempts: Number,
 *   expiresAt: Date,
 *   createdAt: Date
 * }
 */

class OTPModel {
    constructor() {
        this.collectionName = 'otps';
    }

    getCollection() {
        const db = getDB();
        return db.collection(this.collectionName);
    }

    async createIndexes() {
        const collection = this.getCollection();
        // Auto-delete expired OTPs
        await collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
        await collection.createIndex({ email: 1 });
    }

    async create(email, hashedCode, expirationMinutes = 5) {
        const collection = this.getCollection();
        const otp = {
            email: email.toLowerCase(),
            code: hashedCode,
            attempts: 0,
            expiresAt: new Date(Date.now() + expirationMinutes * 60 * 1000),
            createdAt: new Date(),
        };

        // Delete any existing OTPs for this email
        await collection.deleteMany({ email: email.toLowerCase() });

        const result = await collection.insertOne(otp);
        return { ...otp, _id: result.insertedId };
    }

    async findByEmail(email) {
        const collection = this.getCollection();
        return await collection.findOne({
            email: email.toLowerCase(),
            expiresAt: { $gt: new Date() },
        });
    }

    async incrementAttempts(email) {
        const collection = this.getCollection();
        const result = await collection.findOneAndUpdate(
            { email: email.toLowerCase() },
            { $inc: { attempts: 1 } },
            { returnDocument: 'after' }
        );
        return result.value;
    }

    async delete(email) {
        const collection = this.getCollection();
        await collection.deleteMany({ email: email.toLowerCase() });
    }

    async countRecentRequests(email, minutes = 15) {
        const collection = this.getCollection();
        const since = new Date(Date.now() - minutes * 60 * 1000);
        return await collection.countDocuments({
            email: email.toLowerCase(),
            createdAt: { $gte: since },
        });
    }
}

module.exports = new OTPModel();
