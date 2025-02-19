const mongoose = require("mongoose");

const chatbotInteractionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  question: String,
  response: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model("ChatbotInteraction", chatbotInteractionSchema);
