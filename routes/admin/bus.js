const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const fetchadmin = require('../../middleware/fetchadmin');
const router = express.Router();
const Admin = mongoose.model('Admin');

router.post('/add-bus', fetchadmin, async (req, res) => {
    const id = req.user.id;; // Admin ID from params
    const {
      busName,
      busNumber,
      operatorName,
      rate,
      date,
      timing,
      totalSeats,
      arrivalFrom,
      destination
    } = req.body; // Bus details from frontend
  
    try {
      // Validate admin existence
      const admin = await Admin.findById(id);
      if (!admin) {
        return res.status(404).json({ error: "Admin not found" });
      }
  
      // Create a new bus document
      const bus = new Bus({
        busName,
        busNumber,
        operatorName,
        rate,
        date,
        timing,
        totalSeats,
        availableSeats: totalSeats, // Assuming initially all seats are available
        arrivalFrom,
        destination
      });
  
      // Save the bus document
      const savedBus = await bus.save();
  
      // Add the bus to the admin's buses array
      admin.buses.push(savedBus._id);
      await admin.save();
  
      res.status(201).json({ message: "Bus added successfully", bus: savedBus });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred while adding the bus" });
    }
});


module.exports = router