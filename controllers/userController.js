// controllers/userController.js
const User = require('../models/userSchema.js');

const { catchAsync } = require('../utils/errorHandler.js'); // Custom utility for async error handling
const { getZodiacSign } = require('../utils/zodiacHelper.js');
/**
 * @description - Controller to create a new user
 * @route POST /api/users
 * @body {name, dateOfBirth, timeOfBirth, gender, city, state, country}
 */
exports.createUser = async (req, res) => {
    try {
      const { name, dateOfBirth, timeOfBirth, gender, city, state, country } = req.body;
  
      // Calculate the zodiac sign
      const zodiacSign = getZodiacSign(dateOfBirth);
  
      // Create user in the database
      const user = await User.create({
        name,
        dateOfBirth,
        timeOfBirth,
        gender,
        city,
        state,
        country,
        zodiacSign, 
      });
  
      res.status(201).json({
        message: 'User created successfully',
        user,
      });
    } catch (error) {
      console.error('Error creating user:', error.message);
      res.status(500).json({ error: 'Failed to create user' });
    }
  };
/**
 * @description - Controller to fetch user details by ID
 * @route GET /api/users/:id
 * @param {id} userId - User ID
 */
exports.getUser = catchAsync(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.status(200).json({ user });
});

/**
 * @description - Controller to update user information
 * @route PUT /api/users/:id
 * @param {id} userId - User ID
 * @body {name, gender, city, state, country}
 */
exports.updateUser = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { dateOfBirth } = req.body;
  
    // Recalculate zodiacSign if dateOfBirth is updated
    if (dateOfBirth) {
      const newZodiacSign = getZodiacSign(new Date(dateOfBirth));
      req.body.zodiacSign = newZodiacSign;  // Update the zodiacSign
    }
  
    const updatedUser = await User.findByIdAndUpdate(id, req.body, {
      new: true, // Returns the updated document
      runValidators: true, // Validates the updated fields
    });
  
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
  
    return res.status(200).json({
      message: 'User updated successfully',
      updatedUser,
    });
  });
  