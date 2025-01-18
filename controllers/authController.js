const Auth = require('../models/AuthSchema');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { catchAsync } = require('../utils/errorHandler'); // Custom utility for async error handling

/**
 * @description - Controller to register a new user (signup)
 * @route POST /api/auth/signup
 * @body {email, password, userId}
 */
exports.signup = catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, userId } = req.body;

  // Check if the user already exists
  const existingUser = await Auth.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'Email already exists' });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create a new Auth record
  const auth = new Auth({
    email,
    password: hashedPassword,
    userId, // Linking to user
  });

  await auth.save();

  return res.status(201).json({
    message: 'User registered successfully',
    userId,
  });
});

/**
 * @description - Controller to authenticate user and login
 * @route POST /api/auth/login
 * @body {email, password}
 */
exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  // Check if the user exists
  const auth = await Auth.findOne({ email });
  if (!auth) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Compare passwords
  const isMatch = await bcrypt.compare(password, auth.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  // Generate JWT token
  const token = jwt.sign({ userId: auth.userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

  return res.status(200).json({
    message: 'Login successful',
    token,
  });
});

/**
 * @description - Controller to get the authenticated user's details using JWT token
 * @route GET /api/auth/me
 * @header {Authorization: Bearer token}
 */
exports.getMe = catchAsync(async (req, res) => {
  const auth = await Auth.findById(req.userId); // Assuming the userId is passed through middleware

  if (!auth) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.status(200).json({
    message: 'User details retrieved successfully',
    auth,
  });
});
