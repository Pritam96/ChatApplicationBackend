// Import necessary modules
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middleware/error");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config({ path: "./config/config.env" });

// Connect to the database
connectDB();

// Create an Express application
const app = express();

// Middleware for Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Middleware for parsing cookies
app.use(cookieParser());

// Middleware for parsing JSON in request bodies
app.use(express.json());

// Define routes
const auth = require("./routes/auth");
const user = require("./routes/user");
const chat = require("./routes/chat");
const message = require("./routes/message");

// Mount routers
app.use("/api/v1/auth", auth);
app.use("/api/v1/user", user);
app.use("/api/v1/chat", chat);
app.use("/api/v1/message", message);

// ErrorHandler middleware
app.use(errorHandler);

// Serve static files
app.use(express.static("./src"));
app.get("/", (req, res, next) => res.sendFile("index.html"));

// Define the port for the server
const PORT = process.env.PORT || 5000;

// Start the server and listen on the specified port
app.listen(PORT, console.log(`Server is running on port ${PORT}`));

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
