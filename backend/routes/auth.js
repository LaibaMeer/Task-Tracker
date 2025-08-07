const express= require('express');
const jwt= require('jsonwebtoken');
const User= require('../models/User');
const auth= require('../middleware/auth');

const router= express.Router();

//Generate JWT Token
const generateToken = (user) =>{
    return jwt.sign(
        {
            userId: user._id,
            email: user.email
        },
        process.env.JWT_SECRET,
        {expiresIn: '6d'}

    );
};

//Post api/auth/signup
router.post('/signup', async (req, res) => {
    try {
      const { name, email, password } = req.body;
  
      // Validation
      if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
      }
  
      if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters' });
      }
  
      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      // Create user
      const user = new User({ name, email, password });
      await user.save();
  
      // Generate token
      const token = generateToken(user);
  
      res.status(201).json({
        message: 'User created successfully',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // POST /api/auth/login
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Validation
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }
  
      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      // Generate token
      const token = generateToken(user);
  
      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // GET /api/auth/me
  router.get('/me', auth, async (req, res) => {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email
      }
    });
  });
  
  module.exports = router;