import express from "express";
import { randomUUID } from "crypto";
import { pool } from "../config/db.js";
import { requireAuth } from "@clerk/express";

const router = express.Router();

const normalizeTags = (tags) => {
  if (!Array.isArray(tags)) return [];

  return [
    ...new Set(tags.map((tag) => String(tag).trim().toLowerCase())),
  ].filter(Boolean);
};

const canViewCollection = async (userId, collectionId) => {
  const result = await pool.query(
    `SELECT c.id,
            c.user_id,
            c.is_public,
            cm.role
     FROM collections c
     LEFT JOIN collection_members cm
       ON cm.collection_id = c.id AND cm.user_id = $1
     WHERE c.id = $2
       AND (c.user_id = $1 OR cm.user_id IS NOT NULL OR c.is_public = TRUE)`,
    [userId, collectionId],
  );

  return result.rows[0] || null;
};

const canEditCollection = async (userId, collectionId) => {
  const result = await pool.query(
    `SELECT c.id, cm.role
     FROM collections c
     LEFT JOIN collection_members cm
       ON cm.collection_id = c.id AND cm.user_id = $1
     WHERE c.id = $2
       AND (c.user_id = $1 OR cm.user_id IS NOT NULL)`,
    [userId, collectionId],
  );

  return result.rows[0] || null;
};

const upsertTagIds = async (client, userId, tags) => {
  const tagIds = [];

  for (const tag of tags) {
    const tagId = randomUUID();
    const result = await client.query(
      `INSERT INTO tags (id, user_id, name)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, name)
       DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [tagId, userId, tag],
    );

    tagIds.push(result.rows[0].id);
  }

  return tagIds;
};

const replaceLinkTags = async (client, userId, linkId, tagNames) => {
  const normalized = normalizeTags(tagNames);

  await client.query("DELETE FROM link_tags WHERE link_id = $1", [linkId]);

  if (!normalized.length) {
    return;
  }

  const tagIds = await upsertTagIds(client, userId, normalized);

  for (const tagId of tagIds) {
    await client.query(
      `INSERT INTO link_tags (link_id, tag_id)
       VALUES ($1, $2)
       ON CONFLICT (link_id, tag_id) DO NOTHING`,
      [linkId, tagId],
    );
  }
};

const getLinkWithTags = async (client, linkId) => {
  const result = await client.query(
    `SELECT l.*,
            COALESCE(
              ARRAY_REMOVE(ARRAY_AGG(t.name ORDER BY t.name), NULL),
              ARRAY[]::TEXT[]
            ) AS tags
     FROM links l
     LEFT JOIN link_tags lt ON lt.link_id = l.id
     LEFT JOIN tags t ON t.id = lt.tag_id
     WHERE l.id = $1
     GROUP BY l.id`,
    [linkId],
  );

  return result.rows[0] || null;
};

// ✅ Add link — verify collection ownership
router.post("/", async (req, res) => {
  const client = await pool.connect();

  try {
    const userId = req.auth.userId;
    const { collection_id, url, title = "", tags = [] } = req.body;
    const id = randomUUID();

    if (!collection_id || !url) {
      return res
        .status(400)
        .json({ error: "collection_id and url are required" });
    }

    const editAccess = await canEditCollection(userId, collection_id);
    if (!editAccess) {
      return res.status(403).json({ error: "not allowed to add links" });
    }

    await client.query("BEGIN");
    await client.query(
      `INSERT INTO links (id, collection_id, url, title)
       VALUES ($1, $2, $3, $4)`,
      [id, collection_id, url.trim(), title?.trim() || ""],
    );

    await replaceLinkTags(client, userId, id, tags);
    const created = await getLinkWithTags(client, id);
    await client.query("COMMIT");

    res.json(created);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ error: "link create failed" });
  } finally {
    client.release();
  }
});

router.get("/search", async (req, res) => {
  try {
    const userId = req.auth.userId;
    const q = String(req.query.q || "").trim();
    const limit = Math.max(1, Math.min(50, Number(req.query.limit || 20)));

    if (!q) {
      return res.json([]);
    }

    const searchTerm = `%${q}%`;
    const result = await pool.query(
      `SELECT l.*,
              c.name AS collection_name,
              COALESCE(
                ARRAY_REMOVE(ARRAY_AGG(t.name ORDER BY t.name), NULL),
                ARRAY[]::TEXT[]
              ) AS tags
       FROM links l
       JOIN collections c ON c.id = l.collection_id
       LEFT JOIN collection_members cm
         ON cm.collection_id = c.id AND cm.user_id = $1
       LEFT JOIN link_tags lt ON lt.link_id = l.id
       LEFT JOIN tags t ON t.id = lt.tag_id
       WHERE (c.user_id = $1 OR cm.user_id IS NOT NULL OR c.is_public = TRUE)
         AND (
           l.url ILIKE $2
           OR l.title ILIKE $2
           OR t.name ILIKE $2
           OR c.name ILIKE $2
         )
       GROUP BY l.id, c.name
       ORDER BY l.created_at DESC
       LIMIT $3`,
      [userId, searchTerm, limit],
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "search failed" });
  }
});

// ✅ Get links only if collection belongs to user
router.get("/:collectionId", async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { collectionId } = req.params;

    const viewAccess = await canViewCollection(userId, collectionId);
    if (!viewAccess) return res.status(403).json({ error: "forbidden" });

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
      [collectionId],
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "links fetch failed" });
  }
});

// ✅ Update link
router.put("/:id", async (req, res) => {
  const client = await pool.connect();

  try {
    const userId = req.auth.userId;
    const { id } = req.params;
    const { url, title = "", tags = [] } = req.body;

    if (!url?.trim()) {
      return res.status(400).json({ error: "url is required" });
    }

    const accessCheck = await pool.query(
      `SELECT l.id, l.collection_id
       FROM links l
       JOIN collections c ON c.id = l.collection_id
       LEFT JOIN collection_members cm
         ON cm.collection_id = c.id AND cm.user_id = $1
       WHERE l.id = $2
         AND (c.user_id = $1 OR cm.user_id IS NOT NULL)`,
      [userId, id],
    );

    if (!accessCheck.rowCount) {
      return res.status(403).json({ error: "not allowed to edit link" });
    }

    await client.query("BEGIN");
    await client.query("UPDATE links SET url=$1, title=$2 WHERE id=$3", [
      url.trim(),
      title?.trim() || "",
      id,
    ]);

    await replaceLinkTags(client, userId, id, tags);
    const updated = await getLinkWithTags(client, id);
    await client.query("COMMIT");

    res.json(updated);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ error: "link update failed" });
  } finally {
    client.release();
  }
});

// ✅ Delete link
router.delete("/:id", async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.params;

    await pool.query(
      `DELETE FROM links
       WHERE id = $1
         AND collection_id IN (
           SELECT c.id
           FROM collections c
           LEFT JOIN collection_members cm
             ON cm.collection_id = c.id AND cm.user_id = $2
           WHERE c.user_id = $2 OR cm.user_id IS NOT NULL
         )`,
      [id, userId],
    );

    await pool.query("DELETE FROM link_tags WHERE link_id=$1", [id]);
    await pool.query("DELETE FROM click_events WHERE link_id=$1", [id]);

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "link delete failed" });
  }
});

router.post("/:id/click", async (req, res) => {
  const client = await pool.connect();

  try {
    const userId = req.auth.userId;
    const { id } = req.params;

    const linkResult = await pool.query(
      `SELECT l.id, l.collection_id
       FROM links l
       JOIN collections c ON c.id = l.collection_id
       LEFT JOIN collection_members cm
         ON cm.collection_id = c.id AND cm.user_id = $1
       WHERE l.id = $2
         AND (c.user_id = $1 OR cm.user_id IS NOT NULL OR c.is_public = TRUE)`,
      [userId, id],
    );

    if (!linkResult.rowCount) {
      return res.status(404).json({ error: "link not found" });
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

    await client.query(
      `INSERT INTO click_events (id, link_id, collection_id, user_id, referrer, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [eventId, id, collection_id, userId, referrer, userAgent],
    );

    await client.query("COMMIT");

    res.json({ ok: true, click_count: updateResult.rows[0]?.click_count || 0 });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ error: "click tracking failed" });
  } finally {
    client.release();
  }
});

export default router;
