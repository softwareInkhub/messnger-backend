require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import configurations and middleware
const { PORT, NODE_ENV } = require('./config/constants');
const { setupSecurity } = require('./middleware/security');
const errorHandler = require('./middleware/errorHandler');
const Logger = require('./utils/logger');

// Import routes
const messageRoutes = require('./routes/messageRoutes');
const authRoutes = require('./routes/authRoutes');

// Initialize Express app
const app = express();

// Security middleware
setupSecurity(app);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS middleware - Allow requests from Vercel and local development
app.use(cors({
  origin: true, // Allow all origins for now to debug
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Request logging middleware
app.use((req, res, next) => {
  Logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'WhatsApp Backend is running',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    cors: 'enabled',
    endpoints: {
      sendMessage: '/api/sendMessage',
      getMessages: '/api/getMessages',
      health: '/health'
    }
  });
});

// API health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API is working',
    timestamp: new Date().toISOString(),
    cors: 'enabled'
  });
});

// DynamoDB test endpoint
app.get('/test-dynamodb', async (req, res) => {
  try {
    const { SEND_MESSAGES_TABLE } = require('./config/constants');
    const { docClient } = require('./config/database');
    const { ScanCommand } = require('@aws-sdk/lib-dynamodb');
    
    console.log('🧪 Testing DynamoDB connection...');
    console.log('📋 Table name:', SEND_MESSAGES_TABLE);
    
    const params = {
      TableName: SEND_MESSAGES_TABLE,
      Limit: 5
    };
    
    const result = await docClient.send(new ScanCommand(params));
    
    res.json({
      success: true,
      tableName: SEND_MESSAGES_TABLE,
      itemsFound: result.Items?.length || 0,
      sampleItem: result.Items?.[0],
      fullResult: result
    });
  } catch (error) {
    console.error('❌ DynamoDB test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      tableName: require('./config/constants').SEND_MESSAGES_TABLE
    });
  }
});

// Test endpoint
app.post('/test', (req, res) => {
  res.json({
    message: 'Backend is working!',
    timestamp: new Date().toISOString(),
    body: req.body
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api', messageRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  Logger.info(`🚀 WhatsApp Backend running on http://localhost:${PORT}`);
  Logger.info(`📝 Environment: ${NODE_ENV}`);
  Logger.info(`🌍 CORS enabled for frontend integration`);
  Logger.info(`📝 Available endpoints:`);
  Logger.info(`   POST /api/auth/signup - Validate registration data`);
  Logger.info(`   POST /api/auth/verifyOTP - Verify OTP and create user`);
  Logger.info(`   POST /api/auth/login - User login`);
  Logger.info(`   POST /api/sendMessage - Send a message`);
  Logger.info(`   GET  /api/getMessages - Get messages`);
  Logger.info(`   GET  /api/messages/sender/:senderId - Get messages by sender`);
  Logger.info(`   GET  /api/messages/receiver/:receiverId - Get messages by receiver`);
  Logger.info(`   GET  /health - Health check`);
  Logger.info(`   POST /test - Test endpoint`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  Logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    Logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  Logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    Logger.info('Process terminated');
    process.exit(0);
  });
});

module.exports = app;
