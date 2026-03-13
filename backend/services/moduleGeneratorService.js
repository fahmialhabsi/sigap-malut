import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MASTER_DATA_DIR = path.resolve(__dirname, "..", "..", "master-data");
const MODULE_CONFIG_FILE = path.join(
  MASTER_DATA_DIR,
  "00_MASTER_MODUL_CONFIG.csv",
);

const DOMAIN_MODULE_FILES = [
  "00_MASTER_MODUL_UI_SEKRETARIAT.csv",
  "03_MASTER_MODUL_UI_BIDANG_KETERSEDIAAN.csv",
  "06_MASTER_MODUL_UI_BIDANG_DISTRIBUSI.csv",
  "09_MASTER_MODUL_UI_BIDANG_KONSUMSI.csv",
  "12_MASTER_MODUL_UI_UPTD.csv",
];

const MAPPING_FILES = [
  "02_MAPPING_UI_LAYANAN.csv",
  "05_MAPPING_UI_LAYANAN_BIDANG_KETERSEDIAAN.csv",
  "08_MAPPING_UI_LAYANAN_BIDANG_DISTRIBUSI.csv",
  "11_MAPPING_UI_LAYANAN_BIDANG_KONSUMSI.csv",
  "14_MAPPING_UI_LAYANAN_UPTD.csv",
];

const FIELD_FOLDERS = [
  "FIELDS_SEKRETARIAT",
  "FIELDS_BIDANG_KETERSEDIAAN",
  "FIELDS_BIDANG_DISTRIBUSI",
  "FIELDS_BIDANG_KONSUMSI",
  "FIELDS_UPTD",
  "FIELDS",
];

function parseCsv(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];

    if (!fs.existsSync(filePath)) {
      resolve(rows);
      return;
    }

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => rows.push(row))
      .on("end", () => resolve(rows))
      .on("error", reject);
  });
}

function normalizeModuleId(raw) {
  if (!raw) return null;
  return String(raw).trim().toUpperCase();
}

function toKebab(raw) {
  return String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function inferUnitFromFile(fileName) {
  if (fileName.includes("SEKRETARIAT")) return "Sekretariat";
  if (fileName.includes("KETERSEDIAAN")) return "Bidang Ketersediaan";
  if (fileName.includes("DISTRIBUSI")) return "Bidang Distribusi";
  if (fileName.includes("KONSUMSI")) return "Bidang Konsumsi";
  if (fileName.includes("UPTD")) return "UPTD";
  return null;
}

function buildFieldCandidates(moduleId) {
  const id = normalizeModuleId(moduleId);
  if (!id) return [];

  return [
    ...FIELD_FOLDERS.map((folder) =>
      path.join(MASTER_DATA_DIR, folder, `${id}_fields.csv`),
    ),
    ...FIELD_FOLDERS.map((folder) =>
      path.join(MASTER_DATA_DIR, folder, `FIELDS_${id}.csv`),
    ),
  ];
}

async function getFieldStats(moduleId) {
  const candidates = buildFieldCandidates(moduleId);
  for (const candidate of candidates) {
    if (!fs.existsSync(candidate)) continue;
    const rows = await parseCsv(candidate);
    return {
      field_file: path.relative(MASTER_DATA_DIR, candidate).replace(/\\/g, "/"),
      field_count: rows.length,
    };
  }

  return {
    field_file: null,
    field_count: 0,
  };
}

async function loadMappingByModule() {
  const mapping = new Map();

  for (const file of MAPPING_FILES) {
    const filePath = path.join(MASTER_DATA_DIR, file);
    const rows = await parseCsv(filePath);

    for (const row of rows) {
      const moduleId = normalizeModuleId(
        row.modul_ui_id || row.modul_id || row.module_id,
      );
      if (!moduleId) continue;

      const layananRaw = String(row.layanan_ids || "").trim();
      const layanan = layananRaw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      mapping.set(moduleId, {
        layanan_ids: layanan,
        total_layanan:
          Number.parseInt(row.total_layanan || `${layanan.length}`, 10) ||
          layanan.length,
      });
    }
  }

  return mapping;
}

async function loadDomainRegistry() {
  const mapping = await loadMappingByModule();
  const modules = [];

  for (const file of DOMAIN_MODULE_FILES) {
    const filePath = path.join(MASTER_DATA_DIR, file);
    const rows = await parseCsv(filePath);

    for (const row of rows) {
      const moduleId = normalizeModuleId(
        row.modul_id || row.module_id || row.modul_ui_id,
      );
      if (!moduleId) continue;

      const fieldStats = await getFieldStats(moduleId);
      const mapInfo = mapping.get(moduleId) || {
        layanan_ids: [],
        total_layanan: 0,
      };

      modules.push({
        module_id: moduleId,
        module_name: row.nama_modul || row.module_name || moduleId,
        menu_order: Number.parseInt(row.menu_order || "0", 10) || 0,
        unit_kerja: inferUnitFromFile(file),
        source_file: file,
        layanan_ids: mapInfo.layanan_ids,
        total_layanan: mapInfo.total_layanan,
        field_file: fieldStats.field_file,
        field_count: fieldStats.field_count,
      });
    }
  }

  return modules.sort((a, b) => a.module_id.localeCompare(b.module_id));
}

async function loadUiRegistry() {
  const rows = await parseCsv(MODULE_CONFIG_FILE);

  return rows
    .filter((row) => String(row.is_active || "").toLowerCase() === "true")
    .map((row) => ({
      module_id: normalizeModuleId(row.modul_id),
      module_name: row.nama_modul,
      kategori: row.kategori,
      bidang: row.bidang,
      tabel_name: row.tabel_name,
      menu_order: Number.parseInt(row.menu_order || "0", 10) || 0,
      has_approval:
        String(row.has_approval || "false").toLowerCase() === "true",
      has_file_upload:
        String(row.has_file_upload || "false").toLowerCase() === "true",
      source_file: "00_MASTER_MODUL_CONFIG.csv",
    }))
    .sort((a, b) => (a.menu_order || 0) - (b.menu_order || 0));
}

function buildBlueprint(moduleMeta) {
  const rawModule = moduleMeta.module_id || "mod-custom";
  const moduleSlug = toKebab(rawModule);
  const modelName = rawModule.toUpperCase();

  return {
    backend: {
      model: `backend/models/${modelName}.js`,
      controller: `backend/controllers/${modelName}.js`,
      route: `backend/routes/${modelName}.js`,
      migration: `backend/migrations/${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-create-${moduleSlug}.js`,
    },
    frontend: {
      list_page: `frontend/src/pages/module/${modelName}ListPage.jsx`,
      create_page: `frontend/src/pages/${modelName.replace(/-/g, "")}CreatePage.jsx`,
      service: `frontend/src/services/${moduleSlug}Service.js`,
    },
    workflow: {
      engine: "backend/services/workflowEngine.js",
      default_states: ["draft", "submitted", "verified", "approved", "closed"],
      audit_required: true,
    },
    rbac: {
      middleware: "backend/middleware/rbacMiddleware.js",
      permissions: [`module:${moduleSlug}:read`, `module:${moduleSlug}:create`],
    },
  };
}

export async function listMasterDataModules() {
  const [domainModules, uiModules] = await Promise.all([
    loadDomainRegistry(),
    loadUiRegistry(),
  ]);

  return {
    generated_at: new Date().toISOString(),
    summary: {
      domain_modules: domainModules.length,
      ui_modules: uiModules.length,
    },
    domain_modules: domainModules,
    ui_modules: uiModules,
  };
}

export async function generateModuleBlueprint(payload = {}) {
  const moduleId = normalizeModuleId(
    payload.module_id || payload.modul_id || payload.modulId || payload.id,
  );

  const registries = await listMasterDataModules();
  const allModules = [...registries.domain_modules, ...registries.ui_modules];

  let selected = null;
  if (moduleId) {
    selected = allModules.find((item) => item.module_id === moduleId);
  }

  if (!selected && payload.label) {
    const needle = String(payload.label).toLowerCase();
    selected = allModules.find((item) =>
      String(item.module_name || "")
        .toLowerCase()
        .includes(needle),
    );
  }

  if (!selected) {
    const error = new Error("MODULE_NOT_FOUND_IN_MASTER_DATA");
    error.status = 404;
    throw error;
  }

  return {
    module: selected,
    blueprint: buildBlueprint(selected),
    source: "master-data",
  };
}
