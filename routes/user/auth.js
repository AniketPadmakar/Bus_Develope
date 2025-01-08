const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const router = express.Router();
const User = mongoose.model('User');

router.post('/signup', async (req, res) => {
    
    try {
        const { firstName, lastName, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).send({ message: 'Username Already Taken' });
        }

        const user = new User({ firstName, lastName, email, password });
        await user.save();
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET)
        res.send({ token })
      } catch (err) {
        res.status(400).json({ error: err.message });
      }

})

router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
      return res.status(422).send({ error: "Must provide username and password" });
  }

  try {
      const user = await User.findOne({ email });
      if (!user) {
          return res.status(401).send({ error: "Invalid credentials" });
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
          return res.status(401).send({ error: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
      res.send({ token });
  } catch (err) {
      return res.status(500).send({ error: "Internal server error" });
  }
});

module.exports = router