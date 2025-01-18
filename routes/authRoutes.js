const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { signupValidation, loginValidation } = require('../middleware/validationMiddleware.js');
const authMiddleware = require('../middleware/authMiddleware');

// User Signup
router.post('/signup', signupValidation, authController.signup);

// User Login
router.post('/login', loginValidation, authController.login);

// Get authenticated user (requires token)
router.get('/me', authMiddleware.verifyToken, authController.getMe);

module.exports = router;
