import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { clerkMiddleware, requireAuth } from "@clerk/express";

import collectionsRoutes from "./routes/collections.js";
import linksRoutes from "./routes/links.js";
import analyticsRoutes from "./routes/analytics.js";
import publicRoutes from "./routes/public.js";
import { pool } from "./config/db.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(clerkMiddleware());

// Public routes (no authentication required)
app.use("/api/public", publicRoutes);

// Protected routes (authentication required)
app.use("/api/collections", requireAuth(), collectionsRoutes);
app.use("/api/links", requireAuth(), linksRoutes);
app.use("/api/analytics", requireAuth(), analyticsRoutes);

app.get("/", (req, res) => {
  res.send("LinkVault API running");
});

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await pool.query("SELECT 1");
    console.log("Supabase Connected");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to Supabase", error);
    process.exit(1);
  }
};

startServer();
