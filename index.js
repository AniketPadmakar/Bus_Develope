require("dotenv").config();
const ConnectionDB = require("./database");
const express = require("express");
const cors = require("cors");
const cron = require('node-cron');
const path = require("path");
const mongoose = require('mongoose');
require('./models/User');
require('./models/Admin');
require('./models/Bus');
require('./models/Ticket');
const Bus = mongoose.model('Bus');


ConnectionDB();


const app = express()

const port = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

app.use("/api/user", require("./routes/user/auth"))
app.use("/api/user", require("./routes/user/bus"))
app.use("/api/admin", require("./routes/admin/auth"))
app.use("/api/admin", require("./routes/admin/bus"))

// Schedule a cron job to run at midnight every day
cron.schedule('0 0 * * *', async () => {
  try {
      console.log('Running automatic booking reset job...');

      // Get the current day of the week
      const today = new Date().toLocaleString('en-US', { weekday: 'long' });

      // Find buses with a matching frequency for today
      const busesToReset = await Bus.find({ frequency: today });

      // Reset availability for each bus
      for (const bus of busesToReset) {
          bus.availableSeats = bus.totalSeats;
          await bus.save();
      }

      console.log('Booking reset complete for buses:', busesToReset.map(bus => bus.busName));
  } catch (error) {
      console.error('Error during automatic booking reset:', error);
  }
});



app.listen(port, () => {
    console.log(` backend listening at http://localhost:${port}`)
  })