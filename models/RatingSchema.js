const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  feedback: {
    type: String,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  category: {
    type: String, // Can be "gemstone", "pooja", "chatbot", etc.
  },
}, { timestamps: true });

module.exports = mongoose.model("Feedback", feedbackSchema);
