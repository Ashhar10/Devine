import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { config } from "./config.js";

import authRoutes from "./routes/auth.js";
import customerRoutes from "./routes/customers.js";
import orderRoutes from "./routes/orders.js";
import deliveryRoutes from "./routes/deliveries.js";
import paymentRoutes from "./routes/payments.js";
import statsRoutes from "./routes/stats.js";
import { errorHandler } from "./middleware/error.js";

const app = express();

// -------------------------------------
// ✅ CORS MUST BE FIRST
// -------------------------------------
app.use(
  cors({
    origin: "https://ashhar10.github.io",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
    optionsSuccessStatus: 200,
  })
);

// Ensure preflight always succeeds
app.options("*", cors());

// -------------------------------------
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

// -------------------------------------
// Rate Limit (skip preflight)
// -------------------------------------
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 200,
    skip: (req) => req.method === "OPTIONS",
  })
);

// -------------------------------------
app.get("/api/health", (req, res) =>
  res.json({ ok: true, env: config.env })
);
app.get("/healthz", (req, res) =>
  res.json({ ok: true, env: config.env })
);

// -------------------------------------
// Routes
// -------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/stats", statsRoutes);

// -------------------------------------
app.use(errorHandler);

export default app;
