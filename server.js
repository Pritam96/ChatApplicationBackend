const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const errorHandler = require('./middleware/error');

const connectDB = require('./config/db');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDB();

// Route files
const auth = require('./routes/auth');

const app = express();

// CORS
app.use(cors());

// Body parser
app.use(express.json());

// Mount routers
app.use('/api/v1/auth', auth);

//* ErrorHandler
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

const server = app.listen(
  PORT,
  console.log(`Server is running on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
