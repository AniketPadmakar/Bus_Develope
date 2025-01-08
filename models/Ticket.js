const mongoose = require('mongoose');


const ticketSchema = new mongoose.Schema({
    ticketId: { type: String, required: true, unique: true },
    busName: { type: String, required: true },
    timing: { type: String, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    bookingStatus: { type: String, required: true },
    rate: { type: Number, required: true },
    modeOfPayment: { type: String, required: true },

})

module.exports = mongoose.model("Ticket", ticketSchema);