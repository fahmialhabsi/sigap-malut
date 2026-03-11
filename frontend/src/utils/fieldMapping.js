// utils/fieldMapping.js
// Auto-sync field mapping dari master-data/*.csv ke modul UI

const BACKEND_BASE_URL =
  import.meta?.env?.VITE_BACKEND_URL || "http://localhost:5000";

export async function fetchFieldMapping(modulId) {
  const normalizedId = String(modulId || "")
    .trim()
    .toUpperCase();

  if (!normalizedId) return null;

  const candidates = buildCandidatePaths(normalizedId);

  try {
    for (const path of candidates) {
      const url = `${BACKEND_BASE_URL}${path}`;
      const res = await fetch(url);

      if (!res.ok) {
        continue;
      }

      const text = await res.text();
      return parseCsvFields(text);
    }

    return null;
  } catch (e) {
    return null;
  }
}

function buildCandidatePaths(moduleId) {
  const modernFolderByPrefix = {
    "SEK-": "FIELDS_SEKRETARIAT",
    "BKT-": "FIELDS_BIDANG_KETERSEDIAAN",
    "BDS-": "FIELDS_BIDANG_DISTRIBUSI",
    "BKS-": "FIELDS_BIDANG_KONSUMSI",
    "UPT-": "FIELDS_UPTD",
  };

  const matchedPrefix = Object.keys(modernFolderByPrefix).find((prefix) =>
    moduleId.startsWith(prefix),
  );

  const paths = [];

  if (matchedPrefix) {
    const folder = modernFolderByPrefix[matchedPrefix];
    paths.push(`/master-data/${folder}/${moduleId}_fields.csv`);
  }

  // Legacy fallback conventions still used by some modules.
  paths.push(`/master-data/FIELDS/FIELDS_${moduleId}.csv`);
  paths.push(`/master-data/FIELDS/${moduleId}_fields.csv`);

  return paths;
}

function parseCsvFields(csv) {
  if (!csv || !csv.trim()) return [];

  const [header, ...lines] = csv.trim().split(/\r?\n/);
  if (!header) return [];

  const keys = header.split(",");
  return lines.map((line) => {
    const values = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/); // handle koma dalam kutip
    const obj = {};
    keys.forEach((k, i) => {
      obj[k.trim()] = (values[i] || "").replace(/^"|"$/g, "").trim();
    });
    return obj;
  });
}
