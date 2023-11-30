// Import necessary modules
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");
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

// Serve static files
app.use(express.static("./src"));
app.get("*", (req, res, next) => res.sendFile("index.html"));

// ErrorHandler middleware
app.use(errorHandler);

// Define the port for the server
const PORT = process.env.PORT || 4000;

// Start the server and listen on the specified port
const server = app.listen(
  PORT,
  console.log(`Server is running on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Socket.io setup
const io = new Server(server, {
  pingTimeout: 60000,
  cors: { origin: `http://localhost:${PORT}` },
});

// Handle socket connections
io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  // Handle user setup on connection
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  // Handle user joining a chat room
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User joined room:", room);
  });

  // Handle new messages in a chat
  socket.on("new message", (newMessageReceived) => {
    var chat = newMessageReceived.chat;
    if (!chat.users) {
      return console.log("Chat users not defined");
    }
    chat.users.forEach((user) => {
      if (user._id.toString() !== newMessageReceived.sender._id.toString()) {
        socket.in(user._id).emit("message received", newMessageReceived);
      }
    });
  });

  // Handle user disconnection
  socket.off("setup", () => {
    console.log("User disconnected");
    socket.leave(userData._id);
  });
});
