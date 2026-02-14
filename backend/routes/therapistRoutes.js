const express = require('express');
const router = express.Router();
const therapistController = require('../controllers/therapistController');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleAuth');

// Public routes
router.get('/', therapistController.getTherapists);

// Protected Admin routes
router.post('/', authenticate, requireAdmin, therapistController.addTherapist);
router.put('/:id', authenticate, requireAdmin, therapistController.updateTherapist);
router.delete('/:id', authenticate, requireAdmin, therapistController.deleteTherapist);

module.exports = router;
