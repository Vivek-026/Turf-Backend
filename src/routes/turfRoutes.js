const express = require('express');
const router = express.Router();
const turfController = require('../controllers/turfController');
const { authMiddleware } = require('../controllers/userController');

// Public routes
router.get('/', turfController.getTurfs);
router.get('/:id', turfController.getTurfById);

// Protected routes (owner or admin)
router.post('/', authMiddleware, turfController.createTurf);
router.put('/:id', authMiddleware, turfController.updateTurf);
router.delete('/:id', authMiddleware, turfController.deleteTurf);
router.patch('/:id/slots', authMiddleware, turfController.updateSlotStatus);
router.post('/:id/slots', authMiddleware, turfController.addSlots);
router.delete('/:id/slots', authMiddleware, turfController.deleteSlot);
router.patch('/:id/slots', authMiddleware, turfController.updateSlot);
router.patch('/:id/slots', authMiddleware, turfController.updateBulkSlotStatus);
router.get('/:id/slots', authMiddleware, turfController.getSlots);

module.exports = router;
