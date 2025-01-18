const mongoose = require('mongoose');

const authSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // Ensuring email uniqueness
  },
  password: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Referring to the user schema
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Auth', authSchema);
