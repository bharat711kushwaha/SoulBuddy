// controllers/chatController.js
const User = require('../models/User');
const { catchAsync } = require('../utils/errorHandler');

/**
 * @description - Controller to fetch user's chat history
 * @route GET /api/users/:id/chat-history
 * @param {id} userId - User ID
 */
exports.getChatHistory = catchAsync(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.status(200).json({ chatHistory: user.chatHistory });
});

/**
 * @description - Controller to update a user's chat history with new interactions
 * @route PUT /api/users/:id/chat-history
 * @param {id} userId - User ID
 * @body {question, response}
 */
exports.updateChatHistory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { question, response } = req.body;

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  user.chatHistory.push({ date: new Date(), question, response });
  await user.save();

  return res.status(200).json({ message: 'Chat history updated successfully', chatHistory: user.chatHistory });
});
