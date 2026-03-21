import sqlite3 from "sqlite3";

const db = new sqlite3.Database("./database/database.sqlite");

db.all("PRAGMA table_info(roles)", [], (err, cols) => {
  if (err) {
    console.error("Error getting table schema:", err.message);
    db.close();
    return;
  }

  console.log("\n📋 Roles table schema:");
  if (cols && cols.length > 0) {
    cols.forEach((col) => {
      console.log(
        `  - ${col.name} (type: ${col.type}, notnull: ${col.notnull}, default: ${col.dflt_value})`,
      );
    });
  } else {
    console.log("  (No columns found or table doesn't exist)");
  }

  // Try to query one role
  console.log("\n\nTesting role query:");
  db.get("SELECT * FROM roles LIMIT 1", [], (err, row) => {
    if (err) {
      console.error("❌ Error querying role:", err.message);
    } else {
      console.log("✅ Role query successful");
      console.log("Sample role:", row);
    }
    db.close();
  });
});
