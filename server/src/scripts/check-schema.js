import { pool } from "../config/db.js";

async function checkSchema() {
  const client = await pool.connect();

  try {
    console.log("\n📋 Checking existing tables...\n");

    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema='public' AND table_type='BASE TABLE'
      ORDER BY table_name
    `);

    console.log(
      "Tables:",
      tablesResult.rows.map((r) => r.table_name),
    );

    console.log("\n📋 Checking collections table...");
    const collectionsCheck = await client.query(
      "SELECT COUNT(*) FROM collections",
    );
    console.log(
      `  ✓ collections exists (${collectionsCheck.rows[0].count} rows)`,
    );

    console.log("\n📋 Checking collection_members...");
    try {
      const membersCheck = await client.query(
        "SELECT COUNT(*) FROM collection_members",
      );
      console.log(
        `  ✓ collection_members exists (${membersCheck.rows[0].count} rows)`,
      );

      // Check for orphaned records
      const orphanedMembers = await client.query(`
        SELECT cm.* 
        FROM collection_members cm 
        LEFT JOIN collections c ON c.id = cm.collection_id 
        WHERE c.id IS NULL
      `);

      if (orphanedMembers.rowCount > 0) {
        console.log(
          `  ⚠️  Found ${orphanedMembers.rowCount} orphaned collection_members records`,
        );
        console.log("  Orphaned records:", orphanedMembers.rows);
      } else {
        console.log("  ✓ No orphaned collection_members");
      }
    } catch (error) {
      console.log(`  ✗ collection_members does not exist: ${error.message}`);
    }

    console.log("\n📋 Checking links table...");
    try {
      const linksCheck = await client.query("SELECT COUNT(*) FROM links");
      console.log(`  ✓ links exists (${linksCheck.rows[0].count} rows)`);

      // Check for orphaned links
      const orphanedLinks = await client.query(`
        SELECT l.* 
        FROM links l 
        LEFT JOIN collections c ON c.id = l.collection_id 
        WHERE c.id IS NULL
      `);

      if (orphanedLinks.rowCount > 0) {
        console.log(
          `  ⚠️  Found ${orphanedLinks.rowCount} orphaned links records`,
        );
        console.log("  Orphaned records:", orphanedLinks.rows);
      } else {
        console.log("  ✓ No orphaned links");
      }
    } catch (error) {
      console.log(`  ✗ links does not exist: ${error.message}`);
    }

    console.log("\n📋 Checking existing foreign key constraints...");
    const constraintsResult = await client.query(`
      SELECT 
        conname AS constraint_name,
        conrelid::regclass AS table_name,
        confrelid::regclass AS referenced_table
      FROM pg_constraint
      WHERE contype = 'f'
        AND connamespace = 'public'::regnamespace
      ORDER BY conname
    `);

    if (constraintsResult.rowCount === 0) {
      console.log("  ✗ No foreign key constraints found");
    } else {
      console.log("  Existing FK constraints:");
      constraintsResult.rows.forEach((row) => {
        console.log(
          `    - ${row.constraint_name}: ${row.table_name} → ${row.referenced_table}`,
        );
      });
    }
  } finally {
    client.release();
    await pool.end();
  }
}

checkSchema().catch(console.error);
