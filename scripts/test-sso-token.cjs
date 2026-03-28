/**
 * scripts/test-sso-token.cjs
 * Jalankan dari root workspace:
 *   node scripts/test-sso-token.cjs
 */

const fs = require("fs");
const path = require("path");

// jsonwebtoken ada di backend/node_modules, bukan root
const jwt = require(
  path.resolve(__dirname, "../backend/node_modules/jsonwebtoken"),
);

function readEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  return fs
    .readFileSync(filePath, "utf8")
    .split("\n")
    .reduce((acc, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return acc;
      const idx = trimmed.indexOf("=");
      if (idx < 0) return acc;
      acc[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
      return acc;
    }, {});
}

const root = path.resolve(__dirname, "..");
const sigapEnv = readEnv(path.join(root, "backend/.env"));
const ePelaraEnv = readEnv(path.join(root, "e-pelara/backend/.env"));

const sigapSecret = sigapEnv.JWT_SECRET;
const ePelaraSecret = ePelaraEnv.JWT_SECRET;

const sigapEnvPath = path.join(root, "backend/.env");
const ePelaraEnvPath = path.join(root, "e-pelara/backend/.env");

console.log("\n=== SIGAP ↔ e-Pelara SSO Token Verification ===\n");
console.log(
  `📄  SIGAP .env   : ${sigapEnvPath} (${fs.existsSync(sigapEnvPath) ? "ditemukan" : "❌ TIDAK ADA"})`,
);
console.log(
  `📄  e-Pelara .env: ${ePelaraEnvPath} (${fs.existsSync(ePelaraEnvPath) ? "ditemukan" : "❌ TIDAK ADA"})`,
);
console.log();

const isPlaceholder = (val) =>
  !val ||
  val.includes("SIGAP_EPELARA_SHARED") ||
  val.includes("GANTI_DENGAN") ||
  val.includes("your-") ||
  val.length < 32; // secret terlalu pendek

if (isPlaceholder(sigapSecret)) {
  console.error("❌  SIGAP backend/.env: JWT_SECRET tidak valid!");
  console.error(`    Nilai saat ini: "${(sigapSecret || "").slice(0, 40)}..."`);
  console.error(
    "    Pastikan: satu baris penuh (tidak ada line break), minimal 64 karakter hex.\n",
  );
  process.exit(1);
}
if (isPlaceholder(ePelaraSecret)) {
  console.error("❌  e-Pelara backend/.env: JWT_SECRET tidak valid!");
  console.error(
    `    Nilai saat ini: "${(ePelaraSecret || "").slice(0, 40)}..."`,
  );
  console.error(
    "    Pastikan: satu baris penuh (tidak ada line break), minimal 64 karakter hex.\n",
  );
  process.exit(1);
}

console.log("✅  Kedua .env memiliki JWT_SECRET (bukan placeholder).");

if (sigapSecret !== ePelaraSecret) {
  console.error("\n❌  JWT_SECRET BERBEDA antara SIGAP dan e-Pelara!");
  console.error(`    SIGAP   : ${sigapSecret.slice(0, 24)}...`);
  console.error(`    e-Pelara: ${ePelaraSecret.slice(0, 24)}...`);
  console.error(
    "\n    Solusi: copy-paste nilai dari e-pelara/backend/.env ke backend/.env\n",
  );
  process.exit(1);
}

console.log("✅  JWT_SECRET sama di kedua server.\n");

// Simulate token dari SIGAP
const token = jwt.sign(
  { id: 1, username: "test.sso", role: "KEPALA_DINAS", tahun: 2026 },
  sigapSecret,
  { expiresIn: "5m" },
);
console.log("✅  Token di-generate dengan secret SIGAP:");
console.log(`    ${token.slice(0, 60)}...\n`);

// Verifikasi dengan secret e-Pelara
try {
  const decoded = jwt.verify(token, ePelaraSecret);
  console.log("✅  Token diverifikasi dengan secret e-Pelara!");
  console.log(
    `    role : ${decoded.role}  → verifyToken.js akan terjemahkan ke ADMINISTRATOR`,
  );
  console.log("\n🎉  SSO siap digunakan!\n");
} catch (e) {
  console.error("❌  Verifikasi GAGAL:", e.message, "\n");
  process.exit(1);
}
