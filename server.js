const express = require('express');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: './config/config.env' });

const app = express();

const PORT = process.env.PORT || 4000;

app.listen(PORT, console.log(`Server is running on port ${PORT}`));
