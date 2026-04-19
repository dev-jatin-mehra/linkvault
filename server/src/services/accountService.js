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

const hasSupabaseAdminConfig = () => {
  const supabaseUrl = (process.env.SUPABASE_URL || "").trim();
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  return Boolean(supabaseUrl && serviceRoleKey);
};

const deleteUserData = async (userId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query("DELETE FROM collection_members WHERE user_id = $1", [
      userId,
    ]);
    await client.query("DELETE FROM click_events WHERE user_id = $1", [userId]);
    await client.query("DELETE FROM tags WHERE user_id = $1", [userId]);
    await client.query("DELETE FROM collections WHERE user_id = $1", [userId]);

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const deleteSupabaseAuthUser = async (userId) => {
  const { supabaseUrl, serviceRoleKey } = getSupabaseAdminConfig();

  const response = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
    method: "DELETE",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.msg || body?.error || "Auth deletion failed");
  }
};

export const deleteAccountForUser = async (userId) => {
  await deleteUserData(userId);

  if (!hasSupabaseAdminConfig()) {
    return {
      ok: true,
      warning:
        "Auth user was not deleted because SUPABASE_SERVICE_ROLE_KEY is missing.",
    };
  }

  await deleteSupabaseAuthUser(userId);
  return { ok: true, warning: null };
};
