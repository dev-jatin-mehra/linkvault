import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { getAnalyticsOverviewHandler } from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/overview", requireAuth(), getAnalyticsOverviewHandler);

export default router;
