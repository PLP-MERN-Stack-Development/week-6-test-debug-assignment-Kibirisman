const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

const logger = require('./config/logger');
const { connectDB } = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const {
  requestDebugger,
  errorDebugger,
  performanceMonitor,
  memoryMonitor,
  debugEndpoint,
  bugDemonstrator,
} = require('./middleware/debugMiddleware');

// Import routes
const bugRoutes = require('./routes/bugs');

const app = express();

// Connect to database (skip in test environment)
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// HTTP request logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.http(message.trim())
    }
  }));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Debug middleware (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(requestDebugger);
  app.use(performanceMonitor);
  app.use(memoryMonitor);
  app.use(debugEndpoint);
  app.use(bugDemonstrator);
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Bug Tracker API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/api/bugs', bugRoutes);

// Catch 404 and forward to error handler
app.use(notFound);

// Error debugging middleware (before error handler)
if (process.env.NODE_ENV === 'development') {
  app.use(errorDebugger);
}

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;