import "dotenv/config";
import express from "express";
import cors from "cors";

import collectionsRoutes from "./routes/collections.js";
import linksRoutes from "./routes/links.js";
import analyticsRoutes from "./routes/analytics.js";
import publicRoutes from "./routes/public.js";
import accountRoutes from "./routes/account.js";
import { httpLoggingMiddleware } from "./middleware/logging.js";
import logger from "./utils/logger.js";
import * as metrics from "./utils/metrics.js";

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(express.json());

// HTTP Logging & Metrics middleware
app.use(httpLoggingMiddleware);

app.use("/api/public", publicRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/collections", collectionsRoutes);
app.use("/api/links", linksRoutes);
app.use("/api/analytics", analyticsRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Metrics endpoint (Prometheus format)
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", "text/plain");
  res.send(await metrics.getMetrics());
});

app.get("/", (req, res) => {
  res.send("LinkVault API running");
});

export default app;
