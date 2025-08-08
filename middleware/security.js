const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { CORS_ORIGIN, RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS } = require('../config/constants');

// Rate limiting middleware
const rateLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX_REQUESTS,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Parse CORS origins
const corsOrigins = CORS_ORIGIN ? CORS_ORIGIN.split(',').map(origin => origin.trim()) : ['http://localhost:3000'];

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (corsOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Security middleware setup
const setupSecurity = (app) => {
  // Basic security headers
  app.use(helmet());
  
  // Rate limiting
  app.use(rateLimiter);
  
  // CORS
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    
    if (!origin || corsOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin || corsOrigins[0]);
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', true);
    
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });
};

module.exports = {
  setupSecurity,
  rateLimiter
};
