const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  timeOfBirth: {
    type: String, // HH:MM format
  },
  gender: {
    type: String, // Male, Female, Other
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  country: {
    type: String,
  },
  zodiacSign: {
    type: String, // Calculated based on dateOfBirth
  },
  kundali: {
    type: Object, // Stores detailed kundali or birth chart data
  },
  horoscopeHistory: [{
    date: Date,
    dailyHoroscope: String,
    monthlyHoroscope: String,
  }],
  recommendations: [{
    gemstone: String,
    pooja: String,
    doDonts: [String],
  }],
  chatHistory: [{
    date: Date,
    question: String,
    response: String,
  }],
  spiritualPreferences: {
    meditationType: String,
    workoutRecommendations: String,
    sleepContent: String,
  },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
