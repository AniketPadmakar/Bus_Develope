const mongoose = require("mongoose");

const busSchema = new mongoose.Schema({
  busName: { type: String, required: true },
  busNumber: { type: String, required: true, unique: true },
  operatorName: { type: String, required: true },
  rate: { type: Number, required: true },
  date: { type: Date, required: true },
  timing: { type: String, required: true },
  totalSeats: { type: Number, required: true },
  availableSeats: { type: Number, required: true },
  arrivalFrom: { type: String, required: true },
  destination: { type: String, required: true },
  frequency: { type: Number }, // Frequency in days for resetting availability
  tickets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Ticket" }],
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

module.exports = mongoose.model("Bus", busSchema);
