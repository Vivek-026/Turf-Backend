const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Public routes
router.post('/register', userController.register.bind(userController));
router.post('/login', userController.login.bind(userController));

// Protected route
router.get('/profile', userController.authMiddleware.bind(userController), userController.getProfile.bind(userController));

module.exports = router;
