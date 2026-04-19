import { getAnalyticsOverview as getAnalyticsOverviewService } from "../services/analyticsService.js";

export const getAnalyticsOverviewHandler = async (req, res) => {
  try {
    const userId = req.auth().userId;
    const days = Math.max(1, Math.min(365, Number(req.query.days || 30)));

    const result = await getAnalyticsOverviewService(userId, days);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "analytics fetch failed" });
  }
};
