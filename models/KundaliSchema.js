const mongoose = require("mongoose");

const kundaliSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  houses: [{
    houseNumber: Number, // 1 to 12
    planetPositions: [{
      planet: String,
      sign: String,
      degree: Number,
      aspects: [String], // e.g., conjunction, square, opposition
    }],
  }],
  planetaryDasha: [{
    planet: String,
    dashaPeriod: String, // Date or period when the dasha is active
  }],
}, { timestamps: true });

module.exports = mongoose.model("Kundali", kundaliSchema);
