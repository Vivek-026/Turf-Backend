const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authMiddleware } = require('../controllers/userController');

// Book a specific slot
router.post('/:turfId', authMiddleware, bookingController.bookSlot);

// Get all bookings for logged-in user
router.get('/my', authMiddleware, bookingController.getMyBookings);

// Admin/owner: All bookings (filter by turf, status, day)
router.get('/', authMiddleware, bookingController.getAllBookings);

// Cancel a booking
router.patch('/:id/cancel', authMiddleware, bookingController.cancelBooking);

module.exports = router;
