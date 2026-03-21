import sqlite3 from "sqlite3";
import bcrypt from "bcrypt";

const db = new sqlite3.Database("./database/database.sqlite");

// Check if user exists
db.get(
  "SELECT id, username, email, role_id, password FROM users WHERE email = ?",
  ["admin@dinpangan.go.id"],
  async (err, user) => {
    if (err) {
      console.error("Error querying user:", err.message);
      db.close();
      return;
    }

    if (!user) {
      console.log("❌ User not found in database");
      db.close();
      return;
    }

    console.log("\n✅ User found:");
    console.log(`  ID: ${user.id}`);
    console.log(`  Username: ${user.username}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Role ID: ${user.role_id}`);
    console.log(
      `  Password hash (first 50 chars): ${user.password.substring(0, 50)}...`,
    );

    // Test password comparison
    const testPassword = "Admin@123";
    try {
      const isValid = await bcrypt.compare(testPassword, user.password);
      console.log(
        `\nPassword validation test for "${testPassword}": ${isValid ? "✅ VALID" : "❌ INVALID"}`,
      );

      if (!isValid) {
        console.log('\n  This explains the "Email atau password salah" error.');
        console.log(
          "  The password hash stored in the database doesn't match.",
        );
      }
    } catch (bcryptErr) {
      console.error("Error comparing password:", bcryptErr.message);
    }

    db.close();
  },
);
