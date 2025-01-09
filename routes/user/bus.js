const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const fetchusers = require('../../middleware/fetchusers');
const router = express.Router();
const User = mongoose.model('User');
const Admin = mongoose.model('Admin');
const Bus = mongoose.model('Bus');
const Ticket = mongoose.model('Ticket');

router.get('/view-buses', async (req, res) => {
    try {
        const buses = await Bus.find();
        res.json(buses);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }

})

router.post("/book-ticket", fetchusers, async (req, res) => {
    const userId = req.user.id; // Extract user ID from params
    const { busId, busName, timing, from, to, seatNumber } = req.body; // Extract ticket details from body
  
    try {
      // Fetch user from database
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      // Fetch bus from database
      const bus = await Bus.findById(busId);
      if (!bus) {
        return res.status(404).json({ error: "Bus not found" });
      }
  
      // Check if the seat is already booked
      const seatAlreadyBooked = await Ticket.findOne({ busId, seatNumber });
      if (seatAlreadyBooked) {
        return res.status(400).json({ error: "Seat already booked" });
      }
  
      // Create a new ticket
      const ticket = new Ticket({
        busId,
        firstName: user.firstName,
        busName,
        timing,
        from,
        to,
        seatNumber,
      });
  
      // Save the ticket to the database
      const savedTicket = await ticket.save();
  
      // Push the ticket ID to the tickets array of the bus
      if (!bus.tickets) {
        bus.tickets = [];
      }
      bus.tickets.push(savedTicket._id);
  
      // Update available seats
      if (bus.availableSeats > 0) {
        bus.availableSeats -= 1;
      } else {
        return res.status(400).json({ error: "No available seats" });
      }
      await bus.save();
  
      // Push the ticket ID to the ticketsBooked array of the user
      if (!user.ticketsBooked) {
        user.ticketsBooked = [];
      }
      user.ticketsBooked.push(savedTicket._id);
      await user.save();
  
      // Respond with success
      res.status(201).json({
        message: "Ticket booked successfully",
        ticket: savedTicket,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred while booking the ticket" });
    }
  });

  router.get('/view-tickets', fetchusers, async (req, res) => {
    const userId = req.user.id; // Extract user ID from the authenticated request
  
    try {
      // Fetch the user and populate ticketsBooked along with bus details
      const user = await User.findById(userId).populate({
        path: 'ticketsBooked', // Populate the tickets booked by the user
        populate: {
          path: 'busId', // Populate the bus details for each ticket
          model: 'Bus', // Reference to the Bus schema
          select: 'busName busNumber timing arrivalFrom destination', // Fields to include from the Bus schema
        },
      });
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Respond with the tickets booked by the user
      res.status(200).json({
        tickets: user.ticketsBooked,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while fetching tickets' });
    }
  });
  

module.exports = router
