const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const fetchadmin = require('../../middleware/fetchadmin');
const router = express.Router();
const Admin = mongoose.model('Admin');
const Bus = mongoose.model('Bus');


router.put('/add-bus', fetchadmin, async (req, res) => {
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
      destination,
      frequency
    } = req.body; // Bus details from frontend
  
    try {
      // Validate admin existence
      const admin = await Admin.findById(id);
      if (!admin) {
        return res.status(404).json({ error: "Admin not found" });
      }
  
      // Create a new bus document
      let existingBus = await Bus.findOne({ busNumber });
      if (existingBus) {
          // Update existing bus details
          existingBus.busName = busName;
          existingBus.operatorName = operatorName;
          existingBus.rate = rate;
          existingBus.date = date;
          existingBus.timing = timing;
          existingBus.totalSeats = totalSeats;
          existingBus.availableSeats = totalSeats; // Reset available seats
          existingBus.arrivalFrom = arrivalFrom;
          existingBus.destination = destination;
          existingBus.frequency = frequency;

          const updatedBus = await existingBus.save();
          return res.status(200).json({ message: "Bus updated successfully", bus: updatedBus });
      }

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
        destination,
        frequency
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


router.get('/view-buses', fetchadmin, async (req, res) => {
    const id = req.user.id; // Admin ID from params
  
    try {
      // Validate admin existence
      const admin = await Admin.findById(id).populate("buses");
      if (!admin) {
        return res.status(404).json({ error: "Admin not found" });
      }
  
      res.status(200).json({ buses: admin.buses });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred while fetching buses" });
    }
});

router.post('/delete-a-bus', fetchadmin, async (req, res) => {
  const id = req.user.id; // Admin ID from params
  const { busId } = req.body; // Bus ID from frontend

  try {
      // Validate admin existence
      const admin = await Admin.findById(id);
      if (!admin) {
          return res.status(404).json({ error: "Admin not found" });
      }

      // Validate bus existence
      const bus = await Bus.findById(busId);
      if (!bus) {
          return res.status(404).json({ error: "Bus not found" });
      }

      // Remove the bus from the admin's buses array
      admin.buses = admin.buses.filter((bus) => bus.toString() !== busId);
      await admin.save();

      // Delete the bus document
      await Bus.findByIdAndDelete(busId);

      res.status(200).json({ message: "Bus deleted successfully" });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred while deleting the bus" });
  }
});


router.get('/view-total-sales', fetchadmin, async (req, res) => {
  const adminId = req.user.id; // Admin ID from middleware
  
  try {
      // Validate admin existence
      const admin = await Admin.findById(adminId).populate('buses'); // Populates buses data
      if (!admin) {
          return res.status(404).json({ error: "Admin not found" });
      }

      // Calculate total sales
      let totalSales = 0;
      for (const busId of admin.buses) {
          const bus = await Bus.findById(busId);
          if (bus) {
              totalSales += bus.rate * (bus.totalSeats - bus.availableSeats);
          }
      }

      res.status(200).json({ totalSales, message: "Total sales calculated successfully" });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred while calculating total sales" });
  }
});

// Reset all bookings for a specific bus
router.put('/reset-booking', fetchadmin, async (req, res) => {
  const adminId = req.user.id; // Admin ID from token
  const { busId } = req.body; // Bus ID from frontend

  try {
      // Validate admin existence
      const admin = await Admin.findById(adminId);
      if (!admin) {
          return res.status(404).json({ error: "Admin not found" });
      }

      // Validate bus existence
      const bus = await Bus.findById(busId);
      if (!bus) {
          return res.status(404).json({ error: "Bus not found" });
      }

      // Reset the availableSeats to totalSeats
      bus.availableSeats = bus.totalSeats;
      await bus.save();

      res.status(200).json({ message: "All bookings reset successfully. All seats are now available." });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred while resetting bookings" });
  }
});


module.exports = router