const express = require('express');
const { createUser, getUser, updateUser } = require('../controllers/userController');
const { validateUserInput } = require('../middleware/userValidation.js');
const { isValidObjectIdMiddleware } = require('../middleware/userMiddleware');

const router = express.Router();

/**
 * @route POST /api/users
 * @desc Create a new user
 * @access Public
 */
router.post('/', validateUserInput, createUser);

/**
 * @route GET /api/users/:id
 * @desc Get a user by ID
 * @access Public
 */
router.get('/:id', isValidObjectIdMiddleware, getUser);

/**
 * @route PUT /api/users/:id
 * @desc Update user details
 * @access Public
 */
router.put('/:id', isValidObjectIdMiddleware, validateUserInput, updateUser);

module.exports = router;
