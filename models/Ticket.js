const mongoose = require('mongoose');


const ticketSchema = new mongoose.Schema({
    busId: { type: String, required: true }, 
    firstName: { type: String, required: true }, 
    busName: { type: String, required: true },
    timing: { type: String, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    seatNumber: { type: Number, require: true}
}, { timestamps: true });

module.exports = mongoose.model("Ticket", ticketSchema);