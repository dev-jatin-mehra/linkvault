import { randomUUID } from "crypto";
import { pool } from "../config/db.js";

const getSupabaseAdminConfig = () => {
  const supabaseUrl = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Server is missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    );
  }

  return { supabaseUrl, serviceRoleKey };
};

export const resolveUserIdByEmail = async (email) => {
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();
  if (!normalizedEmail) return null;

  const { supabaseUrl, serviceRoleKey } = getSupabaseAdminConfig();

  const response = await fetch(
    `${supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(normalizedEmail)}`,
    {
      method: "GET",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    },
  );

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.msg || body?.error || "User lookup failed");
  }

  const body = await response.json().catch(() => ({}));
  const users = Array.isArray(body?.users) ? body.users : [];
  const matched = users.find(
    (user) => String(user?.email || "").toLowerCase() === normalizedEmail,
  );

  return matched?.id || null;
};

export const createCollection = async (userId, name, isPublic = false) => {
  const id = randomUUID();

  const result = await pool.query(
    "INSERT INTO collections (id, name, user_id, is_public) VALUES ($1,$2,$3,$4) RETURNING *",
    [id, name.trim(), userId, Boolean(isPublic)],
  );

  return result.rows[0];
};

export const getCollectionsForUser = async (userId) => {
  const result = await pool.query(
    `SELECT c.*,
            (c.user_id = $1) AS is_owner,
            CASE
              WHEN c.user_id = $1 THEN 'owner'
              WHEN cm.user_id IS NOT NULL THEN 'shared'
              ELSE 'private'
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
     ORDER BY c.created_at DESC`,
    [userId],
  );

  return result.rows;
};

export const updateCollection = async (userId, id, name, isPublic) => {
  const result = await pool.query(
    "UPDATE collections SET name=$1, is_public=COALESCE($2, is_public) WHERE id=$3 AND user_id=$4 RETURNING *",
    [name.trim(), isPublic, id, userId],
  );

  return result.rows[0] || null;
};

export const deleteCollection = async (userId, id) => {
  const result = await pool.query(
    "DELETE FROM collections WHERE id=$1 AND user_id=$2 RETURNING id",
    [id, userId],
  );

  return result.rowCount > 0;
};

export const isCollectionOwner = async (userId, id) => {
  const result = await pool.query(
    "SELECT id FROM collections WHERE id=$1 AND user_id=$2",
    [id, userId],
  );

  return Boolean(result.rowCount);
};

export const getCollectionMembers = async (userId, id) => {
  const ownerCheck = await isCollectionOwner(userId, id);
  if (!ownerCheck) return null;

  const result = await pool.query(
    "SELECT user_id, role, created_at FROM collection_members WHERE collection_id=$1 ORDER BY created_at DESC",
    [id],
  );

  return result.rows;
};

export const shareCollection = async (userId, id, memberUserId, role) => {
  const ownerCheck = await isCollectionOwner(userId, id);
  if (!ownerCheck) return null;

  const memberId = randomUUID();
  const result = await pool.query(
    `INSERT INTO collection_members (id, collection_id, user_id, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (collection_id, user_id)
     DO UPDATE SET role = EXCLUDED.role
     RETURNING user_id, role, created_at`,
    [memberId, id, memberUserId.trim(), role],
  );

  return result.rows[0];
};

export const removeCollectionMember = async (userId, id, memberUserId) => {
  const ownerCheck = await isCollectionOwner(userId, id);
  if (!ownerCheck) return false;

  await pool.query(
    "DELETE FROM collection_members WHERE collection_id=$1 AND user_id=$2",
    [id, memberUserId],
  );

  return true;
};
