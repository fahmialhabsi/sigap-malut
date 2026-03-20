import sqlite3 from "sqlite3";

const db = new sqlite3.Database("./database/database.sqlite");

db.all("SELECT * FROM users ORDER BY id DESC LIMIT 1", [], (err, rows) => {
  if (err) {
    console.error("Error querying users:", err.message);
    db.close();
    return;
  }

  console.log("\nLatest user in database:");
  if (rows && rows.length > 0) {
    const user = rows[0];
    console.log(JSON.stringify(user, null, 2));
  } else {
    console.log("No users found");
  }

  db.close();
});
