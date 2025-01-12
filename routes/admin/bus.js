const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const fetchadmin = require("../../middleware/fetchadmin");
const router = express.Router();
const Admin = mongoose.model("Admin");
const Bus = mongoose.model("Bus");

// Add a new bus
router.post("/add-bus", fetchadmin, async (req, res) => {
  const adminId = req.user.id; // Admin ID from middleware
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
    frequency,
  } = req.body;

  try {
    // Validate required fields
    if (
      !busName ||
      !busNumber ||
      !rate ||
      !totalSeats ||
      !arrivalFrom ||
      !destination ||
      !frequency
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate admin existence
    const admin = await Admin.findById(adminId);
    // if (!admin) {
    //   return res.status(401).json({ error: "Unauthorized access. Admin not found" });
    // }//
    // Check if a bus with the same bus number already exists
    const existingBus = await Bus.findOne({  
      busNumber,
      destination,
      arrivalFrom,
      date,
      timing, });
    if (existingBus) {
      return res.status(400).json({ error: "Bus with this number already exists" });
    }

    // Create a new bus
    const bus = new Bus({
      busName,
      busNumber,
      operatorName,
      rate,
      date,
      timing,
      totalSeats,
      availableSeats: totalSeats,
      arrivalFrom,
      destination,
      frequency,
    });

    // Save the new bus
    const savedBus = await bus.save();

    // Link the new bus to the admin
    admin.buses.push(savedBus._id);
    await admin.save();

    res.status(201).json({ message: "Bus added successfully", bus: savedBus });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error while adding the bus" });
  }
});

// Update an existing bus
router.put("/update-bus", fetchadmin, async (req, res) => {
  const adminId = req.user.id; // Admin ID from middleware
  const {
    busId,
    busName,
    operatorName,
    rate,
    date,
    timing,
    totalSeats,
    arrivalFrom,
    destination,
    frequency,
  } = req.body;

  try {
    // Validate required fields
    // if (!busId) {
    //   return res.status(400).json({ error: "Bus ID is required" });
    // }

    // Find the bus to update
    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({ error: "Bus not found" });
    }

    // Check if any updatable field has been provided
    const updatableFields = [
      "busName",
      "operatorName",
      "rate",
      "date",
      "timing",
      "totalSeats",
      "arrivalFrom",
      "destination",
      "frequency",
    ];
    const fieldsToUpdate = updates.filter((field) => updatableFields.includes(field));

    if (fieldsToUpdate.length === 0) {
      return res
        .status(400)
        .json({ error: "No valid fields provided for update. Please specify at least one field to update." });
    }
    // Update bus details
    if (busName) bus.busName = busName;
    if (operatorName) bus.operatorName = operatorName;
    if (rate) bus.rate = rate;
    if (date) bus.date = date;
    if (timing) bus.timing = timing;
    if (totalSeats) {
      // Adjust available seats proportionally if totalSeats is changed
      const seatDifference = totalSeats - bus.totalSeats;
      bus.availableSeats += seatDifference;
      bus.totalSeats = totalSeats;
    }
    if (arrivalFrom) bus.arrivalFrom = arrivalFrom;
    if (destination) bus.destination = destination;
    if (frequency) bus.frequency = frequency;

    const updatedBus = await bus.save();

    res.status(200).json({ message: "Bus updated successfully", bus: updatedBus });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error while updating the bus" });
  }
});

router.get("/view-buses", fetchadmin, async (req, res) => {
  const id = req.user.id; // Admin ID from params

  try {
    // Validate admin existence
    const admin = await Admin.findById(id).populate("buses");
    // if (!admin) {
    //   return res.status(404).json({ error: "Admin not found" });
    // }
    res.status(200).json({ buses: admin.buses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching buses" });
  }
});

router.post("/delete-a-bus", fetchadmin, async (req, res) => {
  const id = req.user.id; // Admin ID from params
  const { busId } = req.body; // Bus ID from frontend

  try {
    if (!busId) {
      return res.status(400).json({ error: "Bus ID is required" });
    }

    const admin = await Admin.findById(id);
    // if (!admin) {
    //   return res
    //     .status(401)
    //     .json({ error: "Unauthorized access. Admin not found" });
    // }
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

// router.get("/view-total-sales", fetchadmin, async (req, res) => {
//   const adminId = req.user.id; // Admin ID from middleware

//   try {
//     // Validate admin existence
//     const admin = await Admin.findById(adminId).populate("buses"); // Populates buses data
//     // if (!admin) {
//     //   return res.status(401).json({ error: "Admin not found" });
//     // }

//     // Calculate total sales
//     let totalSales = 0;
//     for (const busId of admin.buses) {
//       const bus = await Bus.findById(busId);
//       if (bus) {
//         totalSales += bus.rate * (bus.totalSeats - bus.availableSeats);
//       }
//     }

//     res
//       .status(200)
//       .json({ totalSales, message: "Total sales calculated successfully" });
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while calculating total sales" });
//   }
// });

// // Reset all bookings for a specific bus
// router.put("/reset-booking", fetchadmin, async (req, res) => {
//   const adminId = req.user.id; // Admin ID from token
//   const { busId } = req.body; // Bus ID from frontend

//   try {
//     if (!busId) {
//       return res.status(400).json({ error: "Bus ID is required" });
//     }

//     const admin = await Admin.findById(adminId);
//     // if (!admin) {
//     //   return res
//     //     .status(401)
//     //     .json({ error: "Unauthorized access. Admin not found" });
//     // }
//     const bus = await Bus.findById(busId);
//     if (!bus) {
//       return res.status(404).json({ error: "Bus not found" });
//     }

//     // Reset the availableSeats to totalSeats
//     bus.availableSeats = bus.totalSeats;
//     await bus.save();

//     res.status(200).json({
//       message: "All bookings reset successfully. All seats are now available.",
//     });
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while resetting bookings" });
//   }
// });

module.exports = router;