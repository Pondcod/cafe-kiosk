// middleware/errorHandler.js

// Central error handling middleware
const errorHandler = (err, req, res, next) => {
  // Log the error
  console.log("Request body:", req.body);
  console.error("Server error:", err);

  // Determine status code
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  // Prepare error response
  const errorResponse = {
    success: false,
    message: err.message || "Internal server error",
  };

  // Include stack trace in development environment
  if (process.env.NODE_ENV !== "production") {
    errorResponse.stack = err.stack;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
