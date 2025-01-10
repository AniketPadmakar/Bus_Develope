const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const fetchusers = require('../../middleware/fetchusers');
const router = express.Router();
const User = mongoose.model('User');
const Admin = mongoose.model('Admin');
const Bus = mongoose.model('Bus');
const Ticket = mongoose.model('Ticket');

// View all buses
router.get('/view-buses', async (req, res) => {
    try {
        const buses = await Bus.find();
        res.status(200).json({ message: "Buses fetched successfully", buses });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Book a ticket
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

// View all tickets for a user or a specific ticket
router.get('/view-tickets', fetchusers, async (req, res) => {
    const userId = req.user.id; // Extract user ID from the authenticated request
    const { ticketId } = req.query; // Optional: Extract ticket ID from query params for individual ticket

    try {
        const user = await User.findById(userId).populate('ticketsBooked'); // Fetch the user

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // If a ticketId is provided, fetch details for that ticket only
        if (ticketId) {
            const ticket = await Ticket.findById(ticketId)
                .populate({
                    path: 'busId', // Populate bus details
                    model: 'Bus',
                    select: 'busName busNumber timing arrivalFrom destination operatorName', // Include extra fields
                });

            if (!ticket) {
                return res.status(404).json({ error: 'Ticket not found' });
            }

            return res.status(200).json({
                message: 'Individual ticket fetched successfully',
                ticket,
            });
        }

        // Fetch minimal details for all tickets booked by the user
        const tickets = await Ticket.find({ _id: { $in: user.ticketsBooked } })
            .populate({
                path: 'busId', // Populate bus details
                model: 'Bus',
                select: 'busName timing arrivalFrom destination', // Fetch only required fields
            })
            .select('busId seatNumber createdAt'); // Fetch only relevant ticket fields

        res.status(200).json({
            message: 'Tickets fetched successfully',
            tickets,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching tickets' });
    }
});
module.exports = router;