const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const fetchusers = require('../../middleware/fetchusers');
const router = express.Router();
const User = mongoose.model('User');
const Admin = mongoose.model('Admin');
const Bus = mongoose.model('Bus');

router.get('/view-buses', async (req, res) => {
    try {
        const buses = await Bus.find();
        res.json(buses);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }

})

router.post('/book-a-ticket', fetchusers, async (req, res) => {
    
  });



module.exports = router
