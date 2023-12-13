// Import necessary modules
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");
const multer = require("multer");
const cron = require("node-cron");
const errorHandler = require("./middleware/error");
const connectDB = require("./config/db");
const archiveMessages = require("./utils/archiveMessages");

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

// Multer configuration
const memoryStorage = multer.memoryStorage();

// Multer middleware for file upload
app.use(multer({ storage: memoryStorage }).single("file"));

// Define routes
const auth = require("./routes/auth");
const user = require("./routes/user");
const chat = require("./routes/chat");
const message = require("./routes/message");
// const archive = require("./routes/archive");

// Mount routers
app.use("/api/v1/auth", auth);
app.use("/api/v1/user", user);
app.use("/api/v1/chat", chat);
app.use("/api/v1/message", message);
// app.use("/api/v1/archive", archive);

// ErrorHandler middleware
app.use(errorHandler);

// Serve static files
app.use(express.static("./src"));
app.get("/", (req, res, next) => res.sendFile("index.html"));

// Define the port for the server
const PORT = process.env.PORT || 5000;

// Start the server and listen on the specified port
const server = app.listen(
  PORT,
  console.log(`Server is running on port ${PORT}`)
);

// Socket.io setup
const io = new Server(server, {
  cors: { origin: `http://localhost:${PORT}` }, // Configure CORS
});

io.on("connection", (socket) => {
  console.log(`User is connected with id: ${socket.id}`);

  socket.on("send-message", (message) => {
    // Emit message to each user in the chat except the sender
    message.chat.users.forEach((user) => {
      if (user._id !== message.sender._id) {
        socket.in(user._id).emit("receive-message", message);
      }
    });
  });

  socket.on("join-room", (room, callback) => {
    socket.join(room);
    callback(`Joined ${room}`); // Send a callback message to the client
  });

  // Handle disconnect
  socket.on("disconnect", async () => {
    console.log(`User disconnected with id: ${socket.id}`);
  });

  // Handle disconnect-and-leave-room
  socket.on("disconnect-and-leave-room", (data, callback) => {
    // Leave any rooms the user has joined
    const rooms = Object.keys(socket.rooms);
    rooms.forEach((room) => {
      if (room !== socket.id) {
        socket.leave(room);
        console.log(`User left room: ${room}`);
      }
    });

    // Disconnect the socket
    socket.disconnect();

    // Callback to the client
    callback();
  });
});

// Schedule the archiving job to run every night at midnight
cron.schedule("0 0 * * *", archiveMessages);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
