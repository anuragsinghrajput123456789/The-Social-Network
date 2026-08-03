const env = require("../config/env");

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const errorHandler = (err, req, res, next) => {
  const isProd = env.NODE_ENV === "production";

  console.error(`[ERROR] ${new Date().toISOString()} - ${req.method} ${req.originalUrl}:`, err.stack || err.message);

  const statusCode = err.status || err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    msg: isProd && statusCode === 500 ? "Internal Server Error" : (err.message || "An error occurred"),
    ...(isProd ? {} : { stack: err.stack })
  });
};

module.exports = { asyncHandler, errorHandler };
