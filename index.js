// Import necessary modules
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const express = require("express");
const path = require("path"); // Required to serve the frontend

// Import routes
const authRoute = require("./Routes/auth");
const userRoute = require("./Routes/user.js");
const convRoute = require("./Routes/conversations");
const msgRoute = require("./Routes/messages.js");
const postRoute = require("./Routes/post.js");

// Load environment variables from .env file
dotenv.config();

// Create the Express application
const app = express();

// Apply middlewares
app.use(bodyParser.json()); // Parse incoming request bodies in JSON format
app.use(cors()); // Enable Cross-Origin Resource Sharing for all routes
app.use(express.json()); // Middleware to parse JSON request bodies

// Serve the uploads directory to access images
app.use('/api/uploads', express.static('uploads'));

// Define API routes
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/conv", convRoute);
app.use("/api/msg", msgRoute);
app.use("/api/posts", postRoute);

// // Serve the React frontend build files
// const frontendPath = path.join(__dirname, "chat", "build");
// app.use(express.static(frontendPath));

// // Handle all other routes by serving the React app
// app.get("*", (req, res) => {
//   res.sendFile(path.join(frontendPath, "index.html"));
// });

// Define the port (from environment variables or default to 5000)
const PORT = process.env.PORT || 5000 ;

// Function to start the server and connect to MongoDB
const startServer = async () => {
  try {
    // Connect to MongoDB (simplified connection)
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");

    // Start the Express server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    // Log the error and exit the process if the connection to MongoDB fails
    console.error("Failed to connect to MongoDB", error);
    process.exit(1); // Exit the process with a failure code
  }
};

// Call the function to start the server
startServer();
