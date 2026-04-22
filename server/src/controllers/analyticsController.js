import { getAnalyticsOverview as getAnalyticsOverviewService } from "../services/analyticsService.js";

export const getAnalyticsOverviewHandler = async (req, res) => {
  try {
    const userId = req.auth().userId;
    const days = Math.max(1, Math.min(365, Number(req.query.days || 30)));
    const collectionId = req.query.collectionId || null;

    if (
      collectionId &&
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        collectionId,
      )
    ) {
      return res.status(400).json({ error: "invalid collectionId" });
    }

    const result = await getAnalyticsOverviewService(
      userId,
      days,
      collectionId,
    );
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "analytics fetch failed" });
  }
};
