import express from "express";
import { randomUUID } from "crypto";
import { pool } from "../config/db.js";

const router = express.Router();

// Get public collection by ID (no auth required)
router.get("/collections/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT c.id, c.name, c.created_at, c.user_id, 
              COUNT(l.id)::INT AS link_count
       FROM collections c
       LEFT JOIN links l ON l.collection_id = c.id
       WHERE c.id = $1 AND c.is_public = TRUE
       GROUP BY c.id`,
      [id],
    );

    if (!result.rowCount) {
      return res
        .status(404)
        .json({ error: "Collection not found or not public" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch collection" });
  }
});

// Get links from a public collection (no auth required)
router.get("/collections/:id/links", async (req, res) => {
  try {
    const { id } = req.params;

    // Verify collection is public
    const collectionCheck = await pool.query(
      "SELECT id FROM collections WHERE id = $1 AND is_public = TRUE",
      [id],
    );

    if (!collectionCheck.rowCount) {
      return res
        .status(404)
        .json({ error: "Collection not found or not public" });
    }

    const result = await pool.query(
      `SELECT l.*,
              COALESCE(
                ARRAY_REMOVE(ARRAY_AGG(t.name ORDER BY t.name), NULL),
                ARRAY[]::TEXT[]
              ) AS tags
       FROM links l
       LEFT JOIN link_tags lt ON lt.link_id = l.id
       LEFT JOIN tags t ON t.id = lt.tag_id
       WHERE l.collection_id = $1
       GROUP BY l.id
       ORDER BY l.created_at DESC`,
      [id],
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch links" });
  }
});

// Track click on a link in a public collection (no auth required)
router.post("/links/:id/click", async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    const linkResult = await pool.query(
      `SELECT l.id, l.collection_id
       FROM links l
       JOIN collections c ON c.id = l.collection_id
       WHERE l.id = $1 AND c.is_public = TRUE`,
      [id],
    );

    if (!linkResult.rowCount) {
      return res.status(404).json({ error: "Link not found or not public" });
    }

    const { collection_id } = linkResult.rows[0];
    const eventId = randomUUID();
    const userAgent = req.get("user-agent") || null;
    const referrer = req.get("referer") || null;

    await client.query("BEGIN");
    const updateResult = await client.query(
      "UPDATE links SET click_count = click_count + 1 WHERE id = $1 RETURNING click_count",
      [id],
    );

    // user_id is NULL for anonymous clicks
    await client.query(
      `INSERT INTO click_events (id, link_id, collection_id, user_id, referrer, user_agent)
       VALUES ($1, $2, $3, NULL, $4, $5)`,
      [eventId, id, collection_id, referrer, userAgent],
    );

    await client.query("COMMIT");

    res.json({ ok: true, click_count: updateResult.rows[0]?.click_count || 0 });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ error: "Click tracking failed" });
  } finally {
    client.release();
  }
});

export default router;
