const express = require("express");
const router = express.Router();
const User = require("../Models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory to save uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Save with a timestamp to avoid name conflicts
  },
});

// Multer upload middleware
const upload = multer({ storage });

// REGISTER route with image upload
router.post("/register", upload.single('avatar'), async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if all required fields are present
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if a user with the same email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user with the avatar path if uploaded
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      avatar: req.file ? req.file.path : '', // Store the image file path in the user document
    });

    // Save the user in the database
    const savedUser = await newUser.save();
    res.status(200).json({ message: "User registered successfully", user: savedUser });
  } catch (err) {
    console.error(err.message); // Log the error for debugging purposes
    res.status(500).json({ message: "Internal server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate if both fields are provided
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare the password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // Generate a JWT access token
    const accessToken = jwt.sign(
      { id: user._id, username: user.username }, // Additional payload
      process.env.JWT_SECRET, // Ensure JWT_SECRET is defined in your .env file
      { expiresIn: "30d" } // Token expires in 30 days
    );

    // Respond with the user and the access token
    res.status(200).json({ message: "Login successful", user });
  } catch (err) {
    console.error(err.message); // Log the error for debugging purposes
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
