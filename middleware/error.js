const ErrorResponse = require('../utils/errorResponse');

//* Express error handler
// const errorHandler = (err, req, res, next) => {
//   console.log(err.stack);
//   res.status(500).json({ success: false, error: err.message });
// };

//* Custom errorHandler
const errorHandler = (err, req, res, next) => {
  // Log error to the console for dev
  console.log(err);

  let error = { ...err };
  error.message = err.message;

  // Mongoose Error: E11000 duplicate key error
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)[0]} field entered`;
    error = new ErrorResponse(message, 409);
  }

  // Mongoose Error: User validation failed
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message, 400);
  }

  res
    .status(error.statusCode || 500)
    .json({ success: false, error: error.message || 'Server Error' });
};

module.exports = errorHandler;
