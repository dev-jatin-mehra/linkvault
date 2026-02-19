import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.resolve(__dirname, "../../migrations");

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function getPendingMigrations(client) {
  const files = (await readdir(migrationsDir))
    .filter((file) => file.endsWith(".sql"))
    .sort((a, b) => a.localeCompare(b));

  const appliedResult = await client.query(
    "SELECT filename FROM schema_migrations",
  );
  const applied = new Set(appliedResult.rows.map((row) => row.filename));

  return files.filter((file) => !applied.has(file));
}

async function runMigration(client, filename) {
  const fullPath = path.join(migrationsDir, filename);
  const sql = await readFile(fullPath, "utf8");

  await client.query("BEGIN");
  try {
    await client.query(sql);
    await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [
      filename,
    ]);
    await client.query("COMMIT");
    console.log(`✅ Applied migration: ${filename}`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw new Error(`Migration failed (${filename}): ${error.message}`);
  }
}

async function migrate() {
  const client = await pool.connect();

  try {
    await ensureMigrationsTable(client);
    const pending = await getPendingMigrations(client);

    if (!pending.length) {
      console.log("No pending migrations.");
      return;
    }

    console.log(`Found ${pending.length} pending migration(s).`);
    for (const migration of pending) {
      await runMigration(client, migration);
    }

    console.log("🎉 Migrations complete.");
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
