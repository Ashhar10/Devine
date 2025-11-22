import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { config } from './config.js';
import authRoutes from './routes/auth.js';
import customerRoutes from './routes/customers.js';
import orderRoutes from './routes/orders.js';
import deliveryRoutes from './routes/deliveries.js';
import paymentRoutes from './routes/payments.js';
import statsRoutes from './routes/stats.js';
import { errorHandler } from './middleware/error.js';

const app = express();

// Trust proxy is required for Render/Heroku (behind load balancer)
app.set('trust proxy', 1);

// Security headers with production-ready configuration
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

// Compression for better performance
app.use(compression());

// Request size limiting to prevent DOS attacks
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Logging
app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));

// Robust CORS handling (allows GitHub Pages, localhost, and preflight OPTIONS)
app.use(
  cors({
    origin: (origin, cb) => {
      // Allow non-browser requests (like Postman or server-to-server)
      if (!origin) return cb(null, true);

      const allowed = config.corsAllowedOrigins;

      // Log CORS attempts in development
      if (config.env === 'development') {
        console.log(`CORS Check: Origin=${origin} Allowed=${allowed.includes(origin)}`);
      }

      if (allowed.includes('*') || allowed.includes(origin)) {
        return cb(null, true);
      }

      // In development, be permissive if not explicitly allowed but safe-ish
      if (config.env === 'development') {
        console.warn(`CORS Warning: Origin ${origin} not in allowed list, allowing anyway for dev.`);
        return cb(null, true);
      }

      return cb(new Error('Not allowed by CORS'));
    },
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
  })
);

// Defensive: ensure CORS header is present even on unexpected errors
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowed = config.corsAllowedOrigins;

  if (!origin || allowed.includes('*') || allowed.includes(origin) || config.env === 'development') {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }

  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Ensure preflight requests succeed globally
app.options('*', cors());

// Global rate limit (200 requests per minute)
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS',
  message: { error: 'Too many requests, please try again later.' },
});
app.use(generalLimiter);

// Strict rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again after 15 minutes.' },
});

// Health check endpoints
app.get('/api/health', (req, res) => res.json({ ok: true, env: config.env }));
app.get('/healthz', (req, res) => res.json({ ok: true, env: config.env }));

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/stats', statsRoutes);

// Error handler (must be last)
app.use(errorHandler);

export default app;