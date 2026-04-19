import express from "express";
import { requireAuth } from "@clerk/express";
import { getAnalyticsOverviewHandler } from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/overview", requireAuth(), getAnalyticsOverviewHandler);

export default router;
