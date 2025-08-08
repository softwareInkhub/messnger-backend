// Environment variables for table names
const SEND_MESSAGES_TABLE = process.env.SEND_MESSAGES_TABLE || 'send-messages-ownmsg';
const RECEIVE_MESSAGES_TABLE = process.env.RECEIVE_MESSAGES_TABLE || 'get-messagewp';

// Server configuration
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security configuration
const JWT_SECRET = process.env.JWT_SECRET;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;

// Logging configuration
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// Validate required environment variables
if (!JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET not set in environment variables');
}

module.exports = {
  // DynamoDB Tables
  SEND_MESSAGES_TABLE,
  RECEIVE_MESSAGES_TABLE,
  
  // Server
  PORT,
  NODE_ENV,
  
  // Security
  JWT_SECRET,
  CORS_ORIGIN,
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS,
  
  // Logging
  LOG_LEVEL
};
