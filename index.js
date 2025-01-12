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
  
        // Get the current date
        const today = new Date();
  
        // Find all buses
        const buses = await Bus.find();
  
        // Reset availability for buses based on frequency
        for (const bus of buses) {
            // Use bus creation date (or another date field) for reset logic
            const busCreationDate = new Date(bus.createdAt); // Replace createdAt with the existing date field
            const diffInDays = Math.floor((today - busCreationDate) / (1000 * 60 * 60 * 24)); // Calculate the difference in days
  
            if (diffInDays % bus.frequency === 0) { // Check if the bus should reset today
                bus.availableSeats = bus.totalSeats; // Reset seats
                await bus.save(); // Save the updated bus data
                console.log(`Reset availability for bus: ${bus.busName}`);
            }
        }
  
        console.log('Booking reset job completed.');
    } catch (error) {
        console.error('Error during automatic booking reset:', error);
    }
  });  



app.listen(port, () => {
    console.log(` backend listening at http://localhost:${port}`)
  })