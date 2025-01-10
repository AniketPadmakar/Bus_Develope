const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const router = express.Router();
const Admin = mongoose.model('Admin');

router.post('/signup', async (req, res) => {
    
    try {
        const { firstName, lastName, email, password } = req.body;

          // Validate required fields
          if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Check if the user already exists
        const existingUser = await Admin.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: "Email already in use" });
        }

        const user = new Admin({ firstName, lastName, email, password });
        await user.save();
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET)
        res.send({ token })
        res.status(201).json({ message: "Signup successful", token });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error during signup" });
    }
});

router.post('/signin', async (req, res) => {
  const { email, password } = req.body;
// Validate required fields
if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
}
  try {
      const user = await Admin.findOne({ email });
      if (!user) {
          return res.status(401).send({ error: "Invalid credentials" });
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
          return res.status(401).send({ error: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
      res.send({ token });
      res.status(200).json({ message: "Signin successful", token });
  } catch (err) {
      return res.status(500).send({ error: "Internal server error" });
  }
});




module.exports = router