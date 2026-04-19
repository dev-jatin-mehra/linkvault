import { pool } from "../config/db.js";

export const getPublicCollection = async (id) => {
  const result = await pool.query(
    `SELECT c.id, c.name, c.created_at, c.user_id,
            COUNT(l.id)::INT AS link_count
     FROM collections c
     LEFT JOIN links l ON l.collection_id = c.id
     WHERE c.id = $1 AND c.is_public = TRUE
     GROUP BY c.id`,
    [id],
  );

  return result.rows[0] || null;
};

export const getPublicCollectionLinks = async (id) => {
  const collectionCheck = await pool.query(
    "SELECT id FROM collections WHERE id = $1 AND is_public = TRUE",
    [id],
  );

  if (!collectionCheck.rowCount) return null;

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

  return result.rows;
};
