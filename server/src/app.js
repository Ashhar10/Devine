import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';
import authRoutes from './routes/auth.js';
import customerRoutes from './routes/customers.js';
import orderRoutes from './routes/orders.js';
import deliveryRoutes from './routes/deliveries.js';
import paymentRoutes from './routes/payments.js';
import statsRoutes from './routes/stats.js';
import { errorHandler } from './middleware/error.js';

const app = express();

app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

// Robust CORS handling (allows GitHub Pages, localhost, and preflight OPTIONS)
app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests from any origin (reflect the request origin)
      // This avoids mismatches when hosting frontend on GitHub Pages.
      cb(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
  })
);
// Ensure preflight requests succeed globally
app.options('*', cors());

// Rate limit but skip preflight to avoid blocking CORS checks
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.method === 'OPTIONS',
  })
);

app.get('/api/health', (req, res) => res.json({ ok: true, env: config.env }));
// Render default health check path support
app.get('/healthz', (req, res) => res.json({ ok: true, env: config.env }));

app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/stats', statsRoutes);

app.use(errorHandler);

export default app;