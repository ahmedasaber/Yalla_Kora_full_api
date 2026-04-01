const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'حدث خطأ في الخادم';

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `${field} مستخدم بالفعل`;
    statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
    statusCode = 400;
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    message = 'token غير صالح';
    statusCode = 401;
  }

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
