const UserModel = require('../models/User');
const logger = require('../utils/logger');
const AppError = require('../utils/AppError');

/**
 * Get all listeners with their stats
 * GET /api/admin/listeners
 */
const getListeners = async (req, res, next) => {
    try {
        const db = UserModel.getCollection().s.db;
        const users = db.collection('users');

        // Find all users with listener role
        const listeners = await users
            .find({ role: 'listener' })
            .project({
                _id: 1,
                name: 1,
                email: 1,
                isAvailable: 1,
                listenerProfile: 1,
                createdAt: 1,
            })
            .toArray();

        // Format the response
        const formattedListeners = listeners.map((listener) => ({
            id: listener._id.toString(),
            name: listener.name,
            email: listener.email,
            isAvailable: listener.isAvailable || false,
            totalCalls: listener.listenerProfile?.totalCalls || 0,
            rating: listener.listenerProfile?.rating || 0,
            specialties: listener.listenerProfile?.specialties || [],
            bio: listener.listenerProfile?.bio || '',
            createdAt: listener.createdAt,
        }));

        res.json({
            success: true,
            data: {
                listeners: formattedListeners,
                total: formattedListeners.length,
            },
        });
    } catch (error) {
        logger.error('Error fetching listeners:', error);
        next(new AppError('Failed to fetch listeners', 500));
    }
};

/**
 * Add a new listener
 * POST /api/admin/listeners
 */
const addListener = async (req, res, next) => {
    try {
        const { name, email, specialties, bio } = req.body;

        if (!name || !email) {
            return next(new AppError('Name and email are required', 400));
        }

        // Check if user already exists
        const existingUser = await UserModel.findByEmail(email);

        let listener;

        if (existingUser) {
            // User exists - upgrade them to listener role
            if (existingUser.role === 'listener') {
                return next(new AppError('This user is already a listener', 400));
            }

            // Upgrade existing user to listener
            listener = await UserModel.update(email, {
                role: 'listener',
                isAvailable: false,
                listenerProfile: {
                    specialties: specialties || [],
                    bio: bio || '',
                    totalCalls: existingUser.listenerProfile?.totalCalls || 0,
                    rating: existingUser.listenerProfile?.rating || 0,
                },
            });

            logger.info(`User upgraded to listener by admin: ${email}`);
        } else {
            // Create new listener
            listener = await UserModel.create({
                name,
                email,
                role: 'listener',
                emailVerified: true,
                isAvailable: false,
                listenerProfile: {
                    specialties: specialties || [],
                    bio: bio || '',
                    totalCalls: 0,
                    rating: 0,
                },
            });

            logger.info(`New listener created by admin: ${email}`);
        }

        res.status(201).json({
            success: true,
            message: existingUser ? 'User upgraded to listener successfully' : 'Listener created successfully',
            data: {
                listener: {
                    id: listener._id.toString(),
                    name: listener.name,
                    email: listener.email,
                    isAvailable: listener.isAvailable,
                    totalCalls: listener.listenerProfile?.totalCalls || 0,
                    rating: listener.listenerProfile?.rating || 0,
                    specialties: listener.listenerProfile?.specialties || [],
                    bio: listener.listenerProfile?.bio || '',
                },
            },
        });
    } catch (error) {
        logger.error('Error creating listener:', error);
        next(new AppError('Failed to create listener', 500));
    }
};

/**
 * Update listener details
 * PUT /api/admin/listeners/:id
 */
const updateListener = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, email, specialties, bio, isAvailable } = req.body;

        const updates = {};
        if (name) updates.name = name;
        if (email) updates.email = email;
        if (typeof isAvailable === 'boolean') updates.isAvailable = isAvailable;
        if (specialties) updates['listenerProfile.specialties'] = specialties;
        if (bio !== undefined) updates['listenerProfile.bio'] = bio;

        const db = UserModel.getCollection().s.db;
        const users = db.collection('users');
        const { ObjectId } = require('mongodb');

        const result = await users.findOneAndUpdate(
            { _id: new ObjectId(id), role: 'listener' },
            { $set: { ...updates, updatedAt: new Date() } },
            { returnDocument: 'after' }
        );

        if (!result.value) {
            return next(new AppError('Listener not found', 404));
        }

        logger.info(`Listener updated by admin: ${id}`);

        res.json({
            success: true,
            message: 'Listener updated successfully',
            data: {
                listener: {
                    id: result.value._id.toString(),
                    name: result.value.name,
                    email: result.value.email,
                    isAvailable: result.value.isAvailable,
                },
            },
        });
    } catch (error) {
        logger.error('Error updating listener:', error);
        next(new AppError('Failed to update listener', 500));
    }
};

/**
 * Delete a listener
 * DELETE /api/admin/listeners/:id
 */
const deleteListener = async (req, res, next) => {
    try {
        const { id } = req.params;

        const db = UserModel.getCollection().s.db;
        const users = db.collection('users');
        const { ObjectId } = require('mongodb');

        const result = await users.deleteOne({
            _id: new ObjectId(id),
            role: 'listener',
        });

        if (result.deletedCount === 0) {
            return next(new AppError('Listener not found', 404));
        }

        logger.info(`Listener deleted by admin: ${id}`);

        res.json({
            success: true,
            message: 'Listener deleted successfully',
        });
    } catch (error) {
        logger.error('Error deleting listener:', error);
        next(new AppError('Failed to delete listener', 500));
    }
};

/**
 * Get admin dashboard statistics
 * GET /api/admin/stats
 */
const getStats = async (req, res, next) => {
    try {
        const db = UserModel.getCollection().s.db;
        const users = db.collection('users');

        const [totalUsers, totalListeners, onlineListeners] = await Promise.all([
            users.countDocuments({ role: 'client' }),
            users.countDocuments({ role: 'listener' }),
            users.countDocuments({ role: 'listener', isAvailable: true }),
        ]);

        // Get total calls from all listeners
        const listenersWithCalls = await users
            .find({ role: 'listener' })
            .project({ 'listenerProfile.totalCalls': 1 })
            .toArray();

        const totalCalls = listenersWithCalls.reduce(
            (sum, listener) => sum + (listener.listenerProfile?.totalCalls || 0),
            0
        );

        res.json({
            success: true,
            data: {
                totalUsers,
                totalListeners,
                onlineListeners,
                totalCalls,
            },
        });
    } catch (error) {
        logger.error('Error fetching stats:', error);
        next(new AppError('Failed to fetch statistics', 500));
    }
};

module.exports = {
    getListeners,
    addListener,
    updateListener,
    deleteListener,
    getStats,
};
