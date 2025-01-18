// routes/chatRoutes.js
const express = require('express');
const { getChatHistory, updateChatHistory } = require('../controllers/chatController');

const router = express.Router();

// Route to fetch chat history
router.get('/users/:id/chat-history', getChatHistory);

// Route to update chat history
router.put('/users/:id/chat-history', updateChatHistory);

module.exports = router;
