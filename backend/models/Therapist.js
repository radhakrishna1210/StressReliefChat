const { getDB } = require('../config/database');
const { ObjectId } = require('mongodb');

class TherapistModel {
    constructor() {
        this.collectionName = 'therapists';
    }

    getCollection() {
        const db = getDB();
        return db.collection(this.collectionName);
    }

    async create(therapistData) {
        const collection = this.getCollection();
        const therapist = {
            ...therapistData,
            rating: therapistData.rating || 0,
            pricePerMin: Number(therapistData.pricePerMin) || 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const result = await collection.insertOne(therapist);
        return { ...therapist, _id: result.insertedId };
    }

    async findAll() {
        const collection = this.getCollection();
        return await collection.find({}).toArray();
    }

    async findById(id) {
        const collection = this.getCollection();
        return await collection.findOne({ _id: new ObjectId(id) });
    }

    async update(id, updates) {
        const collection = this.getCollection();
        console.log(`[TherapistModel] Updating therapist ${id} with:`, updates);
        try {
            // Check if it exists first
            const existing = await collection.findOne({ _id: new ObjectId(id) });
            console.log(`[TherapistModel] Found existing before update:`, existing);

            const result = await collection.findOneAndUpdate(
                { _id: new ObjectId(id) },
                {
                    $set: {
                        ...updates,
                        updatedAt: new Date(),
                    },
                },
                { returnDocument: 'after' }
            );
            console.log(`[TherapistModel] Update result:`, result);

            // Handle different driver versions
            if (result && result.value) return result.value;
            if (result && result._id) return result; // If result is the doc itself
            return result; // Fallback
        } catch (e) {
            console.error(`[TherapistModel] Update error:`, e);
            throw e;
        }
    }

    async delete(id) {
        const collection = this.getCollection();
        const result = await collection.deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount > 0;
    }
}

module.exports = new TherapistModel();
