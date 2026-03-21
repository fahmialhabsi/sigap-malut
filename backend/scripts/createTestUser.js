import sqlite3 from "sqlite3";
import bcrypt from "bcrypt";

const db = new sqlite3.Database("./database/database.sqlite");

// Create test user with kepala_dinas role
const superAdminRoleId = "f47ac10b-58cc-4372-a567-0e02b2c3d479"; // kepala_dinas
const plainPassword = "Admin@123";

async function createTestUser() {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const testUser = {
      username: "admin",
      name: "Administrator",
      email: "admin@dinpangan.go.id",
      password: hashedPassword,
      role_id: superAdminRoleId,
      unit_id: "DINPANGAN",
      nip: "123456789",
      nama_lengkap: "Administrator System",
      unit_kerja: "Dinas Pangan Provinsi Maluku Utara",
      jabatan: "Kepala Dinas",
      role: "kepala_dinas",
      is_active: 1,
      is_verified: 1,
    };

    console.log("Creating test user for login testing...\n");

    db.run(
      `INSERT INTO users (username, name, email, password, role_id, unit_id, nip, nama_lengkap, unit_kerja, jabatan, role, is_active, is_verified, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        testUser.username,
        testUser.name,
        testUser.email,
        testUser.password,
        testUser.role_id,
        testUser.unit_id,
        testUser.nip,
        testUser.nama_lengkap,
        testUser.unit_kerja,
        testUser.jabatan,
        testUser.role,
        testUser.is_active,
        testUser.is_verified,
      ],
      function (err) {
        if (err) {
          console.error("❌ Error creating test user:", err.message);
          db.close();
          process.exit(1);
        }

        console.log("✅ Test user created successfully!\n");
        console.log("Test credentials:");
        console.log(`  Email: ${testUser.email}`);
        console.log(`  Password: ${plainPassword}`);
        console.log(`  Role: Kepala Dinas (kepala_dinas)\n`);
        console.log(`User ID: ${this.lastID}`);

        db.close();
      },
    );
  } catch (err) {
    console.error("❌ Error hashing password:", err.message);
    db.close();
    process.exit(1);
  }
}

createTestUser();
