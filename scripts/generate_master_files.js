// scripts/generate_master_files.js
// Usage: node scripts/generate_master_files.js
import fs from "fs";
import path from "path";

const repoRoot = process.cwd();
const masterCsv = path.join(
  repoRoot,
  "master-data",
  "00_MASTER_MODUL_CONFIG.csv",
);
const targetFieldsDir = path.join(repoRoot, "master-data", "FIELDS");
const frontendFieldsDirs = [
  path.join(repoRoot, "frontend", "public", "master-data", "FIELDS"),
  // include other possible frontend subfolders
];
const frontendPublicMasterData = path.join(
  repoRoot,
  "frontend",
  "public",
  "master-data",
);
const modulesSekretariatOut = path.join(
  frontendPublicMasterData,
  "modules-sekretariat.json",
);

function safeReadFileSync(p) {
  try {
    return fs.readFileSync(p, "utf8");
  } catch (err) {
    return null;
  }
}

function listFilesRecursively(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const it of items) {
    const p = path.join(dir, it.name);
    if (it.isDirectory()) {
      out.push(...listFilesRecursively(p));
    } else if (it.isFile()) {
      out.push(p);
    }
  }
  return out;
}

function findCandidateFieldFile(modulId, tableName) {
  const searchDirs = [
    targetFieldsDir,
    ...frontendFieldsDirs,
    frontendPublicMasterData,
  ];
  for (const dir of searchDirs) {
    if (!fs.existsSync(dir)) continue;
    const files = listFilesRecursively(dir);
    // prefer exact includes modulId or tableName in filename
    const lowerModul = modulId?.toLowerCase() || "";
    const lowerTable = tableName?.toLowerCase() || "";
    // 1) exact modulId
    let found = files.find((f) =>
      path.basename(f).toLowerCase().includes(lowerModul),
    );
    if (found) return found;
    // 2) tableName
    found = files.find((f) =>
      path.basename(f).toLowerCase().includes(lowerTable),
    );
    if (found) return found;
    // 3) any *_fields.csv in same area
    found = files.find((f) => f.toLowerCase().endsWith("_fields.csv"));
    if (found) return found;
  }
  return null;
}

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

if (!fs.existsSync(masterCsv)) {
  console.error("master CSV not found:", masterCsv);
  process.exit(1);
}

const content = fs.readFileSync(masterCsv, "utf8");
const lines = content
  .split(/\r?\n/)
  .map((l) => l.trim())
  .filter(Boolean);

// parse lines into objects; we only need first 12 columns roughly
const modules = lines.map((line) => {
  // split into at most 12 parts to avoid splitting description that may contain commas
  const parts = line.split(",");
  // fallback indexes (based on sample):
  // 0 modul_id, 1 nama_modul, 2 kategori, 3 bidang, 4 tabel_name, 5 deskripsi, 6 icon, 7 has_approval, 8 has_file_upload, 9 is_public, 10 menu_order, 11 is_active
  return {
    raw: line,
    modul_id: (parts[0] || "").trim(),
    nama_modul: (parts[1] || "").trim(),
    kategori: (parts[2] || "").trim(),
    bidang: (parts[3] || "").trim(),
    tabel_name: (parts[4] || "").trim(),
    deskripsi: (parts[5] || "").trim(),
    icon: (parts[6] || "").trim(),
    has_approval: (parts[7] || "").trim() === "true",
    has_file_upload: (parts[8] || "").trim() === "true",
    is_public: (parts[9] || "").trim() === "true",
    menu_order: parseInt((parts[10] || "").trim() || "0", 10) || 0,
    is_active: (parts[11] || "").trim() === "true",
  };
});

// ensure target fields dir exists
ensureDir(targetFieldsDir);

// choose fallback candidates
const fallbackCandidates = [
  path.join(repoRoot, "master-data", "FIELDS", "SA01_fields.csv"),
  path.join(
    repoRoot,
    "frontend",
    "public",
    "master-data",
    "FIELDS",
    "SEK-KEP_fields.csv",
  ),
  path.join(
    repoRoot,
    "frontend",
    "public",
    "master-data",
    "FIELDS",
    "SA01_fields.csv",
  ),
].filter((p) => fs.existsSync(p));

const fallbackContent =
  fallbackCandidates.length > 0
    ? fs.readFileSync(fallbackCandidates[0], "utf8")
    : "field_name,field_label,field_type\nid,ID,auto_increment\n";

const created = [];
const copied = [];

for (const mod of modules) {
  if (!mod.modul_id) continue;
  // we only target modul ids starting with "M" (Mxxx), but you may adjust
  // We'll create files for all modules; frontend asked for FIELDS_M001 etc.
  const targetFilename = `FIELDS_${mod.modul_id}.csv`;
  const targetPath = path.join(targetFieldsDir, targetFilename);

  if (fs.existsSync(targetPath)) {
    // exists, skip
    continue;
  }

  const candidate = findCandidateFieldFile(mod.modul_id, mod.tabel_name);
  if (candidate) {
    // copy candidate to master-data/FIELDS/FIELDS_{modul_id}.csv
    fs.copyFileSync(candidate, targetPath);
    copied.push({
      modul: mod.modul_id,
      from: path.relative(repoRoot, candidate),
      to: path.relative(repoRoot, targetPath),
    });
  } else {
    // create placeholder from fallbackContent
    fs.writeFileSync(targetPath, fallbackContent, "utf8");
    created.push({
      modul: mod.modul_id,
      to: path.relative(repoRoot, targetPath),
    });
  }
}

// Generate modules-sekretariat.json for frontend/public/master-data
ensureDir(frontendPublicMasterData);

const sekretariatModules = modules
  .filter((m) => m.bidang && m.bidang.toLowerCase().includes("sekretariat"))
  .map((m) => ({
    id: m.modul_id,
    modul_id: m.modul_id,
    name: m.nama_modul,
    nama_modul: m.nama_modul,
    kategori: m.kategori || "Sekretariat",
    bidang: m.bidang || "Sekretariat",
    icon: m.icon || "",
    has_approval: !!m.has_approval,
    has_file_upload: !!m.has_file_upload,
    is_public: !!m.is_public,
    menu_order: m.menu_order || 0,
    is_active: !!m.is_active,
  }));

fs.writeFileSync(
  modulesSekretariatOut,
  JSON.stringify(sekretariatModules, null, 2),
  "utf8",
);

// Summary
console.log("=== Generate Master Files Summary ===");
console.log("Modules processed:", modules.length);
console.log("Files copied:");
copied.forEach((c) =>
  console.log("  -", c.modul, " <- ", c.from, " => ", c.to),
);
console.log("Files created (placeholders):");
created.forEach((c) => console.log("  -", c.modul, " => ", c.to));
console.log(
  "Wrote modules-sekretariat.json to:",
  path.relative(repoRoot, modulesSekretariatOut),
);
console.log("Done.");
