import "dotenv/config";
import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";

import collectionsRoutes from "./routes/collections.js";
import linksRoutes from "./routes/links.js";
import analyticsRoutes from "./routes/analytics.js";
import publicRoutes from "./routes/public.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(clerkMiddleware());

app.use("/api/public", publicRoutes);
app.use("/api/collections", collectionsRoutes);
app.use("/api/links", linksRoutes);
app.use("/api/analytics", analyticsRoutes);

app.get("/", (req, res) => {
  res.send("LinkVault API running");
});

export default app;
