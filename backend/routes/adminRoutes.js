const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleAuth');

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// Listener management
router.get('/listeners', adminController.getListeners);
router.post('/listeners', adminController.addListener);
router.put('/listeners/:id', adminController.updateListener);
router.delete('/listeners/:id', adminController.deleteListener);

// Statistics
router.get('/stats', adminController.getStats);

module.exports = router;
