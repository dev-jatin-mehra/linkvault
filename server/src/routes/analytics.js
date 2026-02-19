import express from "express";
import { pool } from "../config/db.js";
import { requireAuth } from "@clerk/express";

const router = express.Router();

router.get("/overview", requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const days = Math.max(1, Math.min(365, Number(req.query.days || 30)));

    const summaryResult = await pool.query(
      `SELECT
         COUNT(DISTINCT c.id)::INT AS total_collections,
         COUNT(DISTINCT l.id)::INT AS total_links,
         COALESCE(SUM(l.click_count), 0)::INT AS total_clicks
       FROM collections c
       LEFT JOIN collection_members cm
         ON cm.collection_id = c.id AND cm.user_id = $1
       LEFT JOIN links l
         ON l.collection_id = c.id
       WHERE c.user_id = $1 OR cm.user_id IS NOT NULL`,
      [userId],
    );

    const topLinksResult = await pool.query(
      `SELECT l.id,
              l.title,
              l.url,
              l.click_count,
              c.name AS collection_name
       FROM links l
       JOIN collections c ON c.id = l.collection_id
       LEFT JOIN collection_members cm
         ON cm.collection_id = c.id AND cm.user_id = $1
       WHERE c.user_id = $1 OR cm.user_id IS NOT NULL
       ORDER BY l.click_count DESC, l.created_at DESC
       LIMIT 10`,
      [userId],
    );

    const clicksByDayResult = await pool.query(
      `SELECT
         TO_CHAR(ce.clicked_at::DATE, 'YYYY-MM-DD') AS day,
         COUNT(*)::INT AS clicks
       FROM click_events ce
       JOIN collections c ON c.id = ce.collection_id
       LEFT JOIN collection_members cm
         ON cm.collection_id = c.id AND cm.user_id = $1
       WHERE (c.user_id = $1 OR cm.user_id IS NOT NULL)
         AND ce.clicked_at >= NOW() - ($2::TEXT || ' days')::INTERVAL
       GROUP BY ce.clicked_at::DATE
       ORDER BY day ASC`,
      [userId, days],
    );

    res.json({
      summary: summaryResult.rows[0] || {
        total_collections: 0,
        total_links: 0,
        total_clicks: 0,
      },
      top_links: topLinksResult.rows,
      clicks_by_day: clicksByDayResult.rows,
      range_days: days,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "analytics fetch failed" });
  }
});

export default router;
