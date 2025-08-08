// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err);

  // Default error
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details = err.message;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403;
    message = 'Forbidden';
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
    message = 'Not Found';
  } else if (err.name === 'ConflictError') {
    statusCode = 409;
    message = 'Conflict';
  }

  // Send error response
  res.status(statusCode).json({
    error: message,
    details: process.env.NODE_ENV === 'development' ? details : 'Something went wrong',
    timestamp: new Date().toISOString(),
    path: req.path
  });
};

module.exports = errorHandler;
