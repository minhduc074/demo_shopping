import { config } from "dotenv";

config({ path: ".env.local" });

async function main() {
  const [{ expectedSchema }, { getPool }] = await Promise.all([
    import("@/lib/db/assumptions"),
    import("@/lib/db/pool"),
  ]);

  const pool = getPool();
  const client = await pool.connect();

  try {
    const missingTables: string[] = [];
    const missingColumns: string[] = [];

    for (const [table, columns] of Object.entries(expectedSchema)) {
      const tableResult = await client.query<{ exists: boolean }>(
        `
          select exists(
            select 1
            from information_schema.tables
            where table_schema = 'public' and table_name = $1
          ) as exists
        `,
        [table],
      );

      if (!tableResult.rows[0]?.exists) {
        missingTables.push(table);
        continue;
      }

      const columnResult = await client.query<{ column_name: string }>(
        `
          select column_name
          from information_schema.columns
          where table_schema = 'public' and table_name = $1
        `,
        [table],
      );

      const currentColumns = new Set(columnResult.rows.map((row: { column_name: string }) => row.column_name));

      for (const column of columns) {
        if (!currentColumns.has(column)) {
          missingColumns.push(`${table}.${column}`);
        }
      }
    }

    if (!missingTables.length && !missingColumns.length) {
      console.log("Schema check passed.");
      return;
    }

    if (missingTables.length) {
      console.error("Missing tables:");
      for (const table of missingTables) {
        console.error(`- ${table}`);
      }
    }

    if (missingColumns.length) {
      console.error("Missing columns:");
      for (const column of missingColumns) {
        console.error(`- ${column}`);
      }
    }

    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error("Schema check failed.");
  console.error(error);
  process.exit(1);
});
