#!/usr/bin/env node
import fs from "fs/promises";
import path from "path";

const root = process.cwd();
const now = new Date().toISOString().replace(/[:.]/g, "-");

async function backup(file) {
  try {
    const abs = path.join(root, file);
    const bak = `${abs}.bak.${now}`;
    await fs.copyFile(abs, bak);
    console.log(`Backed up ${file} -> ${path.relative(root, bak)}`);
  } catch (e) {
    // missing file -> ignore
  }
}

async function write(file, content) {
  const abs = path.join(root, file);
  await fs.writeFile(abs, content, { encoding: "utf8" });
  console.log(`Wrote ${file}`);
}

async function patchFileReplace(file, re, replacement) {
  const abs = path.join(root, file);
  try {
    const src = await fs.readFile(abs, "utf8");
    const out = src.replace(re, replacement);
    if (out === src) {
      console.log(`No change for ${file}`);
    } else {
      await backup(file);
      await fs.writeFile(abs, out, "utf8");
      console.log(`Patched ${file}`);
    }
  } catch (e) {
    console.warn(`Failed to patch ${file}: ${e.message}`);
  }
}

const backendEnv = `# =====================================================
# SIGAP MALUT - ENVIRONMENT CONFIGURATION
# =====================================================

# Application
NODE_ENV=development
PORT=5000
APP_NAME=SIGAP Malut
APP_URL=http://localhost:5000

# Database - PostgreSQL (Aktif, matikan SQLite!)
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sigap
DB_USER=sekretaris
DB_PASSWORD=123

# SQLite (NONAKTIF)
# DB_DIALECT=sqlite
# DB_STORAGE=./database/database.sqlite

# JWT Secret
JWT_SECRET=sigap_malut_secret_key_2026_change_in_production
JWT_EXPIRES_IN=7d

# OpenAI API (Optional - jika ada AI fitur)
# OPENAI_API_KEY=sk-your-actual-openai-api-key

# File Upload
UPLOAD_MAX_SIZE=10485760
UPLOAD_ALLOWED_TYPES=pdf,doc,docx,xls,xlsx,jpg,jpeg,png

# Email (Optional - untuk notifikasi nanti)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your_email@gmail.com
# SMTP_PASSWORD=your_app_password

# Master Data Path
MASTER_DATA_PATH=../master-data

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:5173

# Security
BCRYPT_ROUNDS=10
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
`;

const frontendEnv = `VITE_API_URL=http://localhost:5000/api\n`;

async function main() {
  console.log("Starting auto-fix generator: sync env + frontend config to PORT=5000 and Postgres");

  // backend/.env
  await backup("backend/.env");
  await write("backend/.env", backendEnv);

  // frontend/.env
  await backup("frontend/.env");
  await write("frontend/.env", frontendEnv);

  // patch vite.config.js proxy to port 5000
  await patchFileReplace(
    "frontend/vite.config.js",
    /(\"\/api\":\s*\")http:\/\/localhost:\\d+(\"\s*[,}])/m,
    '$1http://localhost:5000$2'
  );

  // patch src/utils/api.js fallback baseURL
  await patchFileReplace(
    "frontend/src/utils/api.js",
    /http:\/\/localhost:\\d+\/api/g,
    "http://localhost:5000/api",
  );

  console.log("\nSelesai. Periksa perubahan dan restart dev servers:");
  console.log("  cd backend && npm run dev");
  console.log("  cd frontend && npm run dev");
  console.log("\nCatatan: script ini hanya mengubah konfigurasi frontend/backend. Pastikan Postgres berjalan dan database 'sigap' tersedia sebelum menjalankan backend pada port 5000.");
}

main().catch((e) => {
  console.error("Generator failed:", e);
  process.exit(1);
});
