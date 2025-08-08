const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register user route
router.post('/signup', authController.registerUser);

// Verify OTP route (using ID token)
router.post('/verifyOTP', authController.verifyOTP);

// Login route
router.post('/login', authController.loginUser);

module.exports = router;





