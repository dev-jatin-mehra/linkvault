import express from "express";
import { randomUUID } from "crypto";
import { pool } from "../config/db.js";

const router = express.Router();

// ✅ Create collection (user-owned)
router.post("/", async (req, res) => {
  try {
    const userId = req.userId;
    const { name, is_public = false } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ error: "name is required" });
    }

    const id = randomUUID();

    const result = await pool.query(
      "INSERT INTO collections (id, name, user_id, is_public) VALUES ($1,$2,$3,$4) RETURNING *",
      [id, name.trim(), userId, Boolean(is_public)],
    );

    res.json(result.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "create failed" });
  }
});

// ✅ Get only MY collections
router.get("/", async (req, res) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      `SELECT c.*,
              (c.user_id = $1) AS is_owner,
              CASE
                WHEN c.user_id = $1 THEN 'owner'
                WHEN cm.user_id IS NOT NULL THEN 'shared'
                ELSE 'public'
              END AS access_level,
              (
                SELECT COUNT(*)::INT
                FROM collection_members cm2
                WHERE cm2.collection_id = c.id
              ) AS members_count
       FROM collections c
       LEFT JOIN collection_members cm
         ON cm.collection_id = c.id AND cm.user_id = $1
       WHERE c.user_id = $1
          OR cm.user_id IS NOT NULL
          OR c.is_public = TRUE
       ORDER BY c.created_at DESC`,
      [userId],
    );

    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: "fetch failed" });
  }
});

// ✅ Update collection (ownership enforced)
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, is_public } = req.body;
    const userId = req.userId;

    if (!name?.trim()) {
      return res.status(400).json({ error: "name is required" });
    }

    const result = await pool.query(
      "UPDATE collections SET name=$1, is_public=COALESCE($2, is_public) WHERE id=$3 AND user_id=$4 RETURNING *",
      [name.trim(), is_public, id, userId],
    );

    res.json(result.rows[0] || null);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "update failed" });
  }
});

// ✅ Delete collection (ownership enforced)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    await pool.query("DELETE FROM collection_members WHERE collection_id=$1", [
      id,
    ]);
    await pool.query("DELETE FROM collections WHERE id=$1 AND user_id=$2", [
      id,
      userId,
    ]);

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "delete failed" });
  }
});

router.get("/:id/members", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const ownerCheck = await pool.query(
      "SELECT id FROM collections WHERE id=$1 AND user_id=$2",
      [id, userId],
    );

    if (!ownerCheck.rowCount) {
      return res.status(403).json({ error: "only owner can view members" });
    }

    const result = await pool.query(
      "SELECT user_id, role, created_at FROM collection_members WHERE collection_id=$1 ORDER BY created_at DESC",
      [id],
    );

    res.json(result.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "members fetch failed" });
  }
});

router.post("/:id/share", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { memberUserId, role = "viewer" } = req.body;

    if (!memberUserId?.trim()) {
      return res.status(400).json({ error: "memberUserId is required" });
    }

    if (!["viewer", "editor", "admin"].includes(role)) {
      return res.status(400).json({ error: "invalid role" });
    }

    if (memberUserId === userId) {
      return res.status(400).json({ error: "owner already has access" });
    }

    const ownerCheck = await pool.query(
      "SELECT id FROM collections WHERE id=$1 AND user_id=$2",
      [id, userId],
    );

    if (!ownerCheck.rowCount) {
      return res.status(403).json({ error: "only owner can share" });
    }

    const memberId = randomUUID();

    const result = await pool.query(
      `INSERT INTO collection_members (id, collection_id, user_id, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (collection_id, user_id)
       DO UPDATE SET role = EXCLUDED.role
       RETURNING user_id, role, created_at`,
      [memberId, id, memberUserId.trim(), role],
    );

    res.json(result.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "share failed" });
  }
});

router.delete("/:id/members/:memberUserId", async (req, res) => {
  try {
    const { id, memberUserId } = req.params;
    const userId = req.userId;

    const ownerCheck = await pool.query(
      "SELECT id FROM collections WHERE id=$1 AND user_id=$2",
      [id, userId],
    );

    if (!ownerCheck.rowCount) {
      return res.status(403).json({ error: "only owner can remove members" });
    }

    await pool.query(
      "DELETE FROM collection_members WHERE collection_id=$1 AND user_id=$2",
      [id, memberUserId],
    );

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "remove member failed" });
  }
});

router.get("/test", (req, res) => {
  res.send("collections test works");
});

export default router;
