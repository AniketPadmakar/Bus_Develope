const mongoose = require('mongoose');

const QuerySchema = new mongoose.Schema({
    queryId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, required: true, enum: ["User", "Admin"] },
    query: { type: String, required: true },
    ticketId: { type: String },
  });
  
  module.exports = mongoose.model("Query", querySchema);