const mongoose = require('mongoose');

const QuerySchema = new mongoose.Schema({
    queryId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    query: { type: String, required: true },
    ticketId: { type: String },
  });
  
  module.exports = mongoose.model("Query", querySchema);