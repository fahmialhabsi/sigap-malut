import pkg from "pg";
const { Client } = pkg;

const client = new Client({
  host: "localhost",
  port: 5432,
  database: "sigap",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
});

await client.connect();

console.log('\n📊 Checking PostgreSQL "sigap" database tables:\n');

const result = await client.query(`
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  ORDER BY table_name
`);

if (result.rows.length > 0) {
  console.log(`Found ${result.rows.length} tables:`);
  result.rows.forEach((row) => {
    console.log(`  - ${row.table_name}`);
  });

  // Check if roles table exists
  const hasRoles = result.rows.some((row) => row.table_name === "roles");
  console.log(`\n✅ Roles table exists: ${hasRoles ? "YES" : "NO"}`);

  if (hasRoles) {
    // Check columns
    const colResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'roles'
    `);

    console.log("\nRoles table columns:");
    colResult.rows.forEach((row) => {
      console.log(`  - ${row.column_name}`);
    });

    const hasCode = colResult.rows.some((row) => row.column_name === "code");
    console.log(`\n✅ Code column exists: ${hasCode ? "YES" : "NO"}`);
  }
} else {
  console.log("(No tables found)");
}

await client.end();
