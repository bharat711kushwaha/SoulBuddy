const mongoose = require("mongoose");

const horoscopeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  date: {
    type: Date,
    required: true,
  },
  dailyHoroscope: {
    type: String,
    required: true,
  },
  monthlyHoroscope: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model("Horoscope", horoscopeSchema);
