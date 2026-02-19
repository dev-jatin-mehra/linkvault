import { pool } from "../config/db.js";

async function checkColumnTypes() {
  const client = await pool.connect();

  try {
    console.log("\n📋 Checking column data types...\n");

    const columnsResult = await client.query(`
      SELECT 
        table_name,
        column_name,
        data_type,
        udt_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name IN ('collections', 'links', 'collection_members', 'tags', 'link_tags', 'click_events')
        AND column_name ILIKE '%id%'
      ORDER BY table_name, ordinal_position
    `);

    const grouped = {};
    columnsResult.rows.forEach((row) => {
      if (!grouped[row.table_name]) grouped[row.table_name] = [];
      grouped[row.table_name].push(
        `  ${row.column_name}: ${row.data_type}/${row.udt_name}`,
      );
    });

    Object.entries(grouped).forEach(([table, columns]) => {
      console.log(`${table}:`);
      columns.forEach((col) => console.log(col));
      console.log("");
    });
  } finally {
    client.release();
    await pool.end();
  }
}

checkColumnTypes().catch(console.error);
