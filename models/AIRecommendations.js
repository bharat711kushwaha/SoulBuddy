const mongoose = require("mongoose");

const aiRecommendationsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  recommendations: [{
    gemstone: String,
    pooja: String,
    doDonts: [String],
  }],
  personalizedInsights: String,
  ritualSuggestions: [{
    ritualName: String,
    ritualDescription: String,
    benefits: String,
  }],
}, { timestamps: true });

module.exports = mongoose.model("AIRecommendations", aiRecommendationsSchema);
