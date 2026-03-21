import sqlite3 from "sqlite3";

const db = new sqlite3.Database("./database/database.sqlite");

db.all("SELECT * FROM roles", [], (err, rows) => {
  if (err) {
    console.error("Error querying roles:", err.message);
    db.close();
    process.exit(1);
  }

  console.log(`\nTotal roles: ${rows ? rows.length : 0}\n`);
  if (rows && rows.length > 0) {
    rows.forEach((role, idx) => {
      console.log(`[${idx + 1}] ID: ${role.id}`);
      console.log(`    Name: ${role.name}`);
      console.log(`    Code: ${role.code}`);
      console.log(`    Level: ${role.level}`);
      console.log(`    Active: ${role.is_active}\n`);
    });
  } else {
    console.log("(No roles found)\n");
  }

  db.close();
});
