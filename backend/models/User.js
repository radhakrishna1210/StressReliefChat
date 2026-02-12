const { getDB } = require('../config/database');

/**
 * User Schema:
 * {
 *   name: String,
 *   email: String (unique, required),
 *   phone: String,
 *   password: String (hashed, optional - for password-based auth),
 *   provider: String ('local', 'google', 'otp'),
 *   emailVerified: Boolean,
 *   emailVerificationToken: String,
 *   passwordResetToken: String,
 *   passwordResetExpires: Date,
 *   loginAttempts: Number,
 *   lockUntil: Date,
 *   role: String ('client', 'listener', 'admin'),
 *   isAvailable: Boolean (for listeners - online/offline status),
 *   listenerProfile: {
 *     specialties: [String],
 *     bio: String,
 *     totalCalls: Number,
 *     rating: Number
 *   },
 *   createdAt: Date,
 *   updatedAt: Date
 * }
 */

class UserModel {
    constructor() {
        this.collectionName = 'users';
    }

    getCollection() {
        const db = getDB();
        return db.collection(this.collectionName);
    }

    async createIndexes() {
        const collection = this.getCollection();
        await collection.createIndex({ email: 1 }, { unique: true });
        await collection.createIndex({ emailVerificationToken: 1 });
        await collection.createIndex({ passwordResetToken: 1 });
    }

    async findByEmail(email) {
        const collection = this.getCollection();
        return await collection.findOne({ email: email.toLowerCase() });
    }

    async findById(id) {
        const collection = this.getCollection();
        const { ObjectId } = require('mongodb');
        return await collection.findOne({ _id: new ObjectId(id) });
    }

    async create(userData) {
        const collection = this.getCollection();
        const user = {
            ...userData,
            email: userData.email.toLowerCase(),
            emailVerified: userData.emailVerified || false,
            loginAttempts: 0,
            role: userData.role || 'client',
            isAvailable: userData.role === 'listener' ? false : undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const result = await collection.insertOne(user);
        return { ...user, _id: result.insertedId };
    }

    async update(email, updates) {
        const collection = this.getCollection();
        const result = await collection.findOneAndUpdate(
            { email: email.toLowerCase() },
            {
                $set: {
                    ...updates,
                    updatedAt: new Date(),
                },
            },
            { returnDocument: 'after' }
        );
        return result.value;
    }

    async incrementLoginAttempts(email) {
        const collection = this.getCollection();
        const user = await this.findByEmail(email);

        if (!user) return null;

        const updates = {
            $inc: { loginAttempts: 1 },
            $set: { updatedAt: new Date() },
        };

        // Lock account after 5 failed attempts for 15 minutes
        if (user.loginAttempts + 1 >= 5) {
            updates.$set.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        }

        const result = await collection.findOneAndUpdate(
            { email: email.toLowerCase() },
            updates,
            { returnDocument: 'after' }
        );
        return result.value;
    }

    async resetLoginAttempts(email) {
        const collection = this.getCollection();
        const result = await collection.findOneAndUpdate(
            { email: email.toLowerCase() },
            {
                $set: {
                    loginAttempts: 0,
                    lockUntil: null,
                    updatedAt: new Date(),
                },
            },
            { returnDocument: 'after' }
        );
        return result.value;
    }

    async isLocked(email) {
        const user = await this.findByEmail(email);
        if (!user) return false;

        if (user.lockUntil && user.lockUntil > new Date()) {
            return true;
        }

        // Reset lock if expired
        if (user.lockUntil && user.lockUntil <= new Date()) {
            await this.resetLoginAttempts(email);
            return false;
        }

        return false;
    }
}

module.exports = new UserModel();
