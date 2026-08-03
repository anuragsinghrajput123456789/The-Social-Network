const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const fs = require('fs');
const mongoose = require('mongoose');

const indexRouter = require('./routes/index');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');
const { sanitizeInput } = require('./middleware/sanitizeMiddleware');
const { apiLimiter, authLimiter, commentLimiter, interactionLimiter } = require('./middleware/rateLimitMiddleware');

const app = express();

// Security Headers
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Auto-create uploads directory if it does not exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Connect MongoDB database
connectDB();

app.use(logger('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['*'];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Fallback for dev ease
      }
    },
    credentials: true
  })
);

// Input Sanitization (NoSQL & XSS)
app.use(sanitizeInput);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    dbState: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Apply Rate Limiters
app.use('/login', authLimiter);
app.use('/signup', authLimiter);
app.use('/addComment', commentLimiter);
app.use('/toggleLike', interactionLimiter);
app.use('/toggleFollow', interactionLimiter);
app.use('/', apiLimiter);

app.use('/uploads', express.static(uploadsDir));

// Mount API router
app.use('/', indexRouter);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Global error handler middleware
app.use(errorHandler);

module.exports = app;
