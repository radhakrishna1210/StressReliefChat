const Therapist = require('../models/Therapist');
const logger = require('../utils/logger');

exports.getTherapists = async (req, res, next) => {
    try {
        const therapists = await Therapist.findAll();

        // Map _id to id for frontend compatibility
        const formattedTherapists = therapists.map(t => ({
            ...t,
            id: t._id.toString()
        }));

        res.json({
            success: true,
            data: formattedTherapists
        });
    } catch (error) {
        logger.error('Error fetching therapists:', error);
        next(error);
    }
};

exports.addTherapist = async (req, res, next) => {
    try {
        const { name, title, description, credentials, specialties, pricePerMin, avatar, experience } = req.body;

        if (!name || !title || !pricePerMin) {
            return res.status(400).json({
                success: false,
                error: 'Please provide name, title, and price per minute'
            });
        }

        const newTherapist = await Therapist.create({
            name,
            title,
            description,
            credentials,
            specialties: Array.isArray(specialties) ? specialties : [],
            pricePerMin,
            avatar,
            experience,
            rating: 5.0
        });

        res.status(201).json({
            success: true,
            data: { ...newTherapist, id: newTherapist._id }
        });
    } catch (error) {
        logger.error('Error adding therapist:', error);
        next(error);
    }
};

exports.updateTherapist = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        delete updates._id; // Prevent updating _id

        logger.info(`[Controller] Updating therapist ${id}`);

        const updatedTherapist = await Therapist.update(id, updates);

        logger.info(`[Controller] Update result: ${updatedTherapist ? 'Success' : 'Not Found'}`);

        if (!updatedTherapist) {
            return res.status(404).json({
                success: false,
                error: 'Therapist not found'
            });
        }

        res.json({
            success: true,
            data: { ...updatedTherapist, id: updatedTherapist._id }
        });
    } catch (error) {
        logger.error('Error updating therapist:', error);
        next(error);
    }
};

exports.deleteTherapist = async (req, res, next) => {
    try {
        const { id } = req.params;
        const success = await Therapist.delete(id);

        if (!success) {
            return res.status(404).json({
                success: false,
                error: 'Therapist not found'
            });
        }

        res.json({
            success: true,
            message: 'Therapist deleted successfully'
        });
    } catch (error) {
        logger.error('Error deleting therapist:', error);
        next(error);
    }
};
