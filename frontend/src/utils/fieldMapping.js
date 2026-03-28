// utils/fieldMapping.js
// Auto-sync field mapping dari master-data/*.csv ke modul UI

const BACKEND_BASE_URL =
  (typeof process !== "undefined" &&
    process.env &&
    process.env.VITE_BACKEND_URL) ||
  "http://localhost:5000";

export async function fetchFieldMapping(modulId) {
  // File convention: FIELDS_<MODULID>.csv
  const fileName = `FIELDS_${modulId}.csv`;

  try {
    // 1) Source of truth: backend serves repo root /master-data as static files
    const url = `${BACKEND_BASE_URL}/master-data/FIELDS/${fileName}`;
    const res = await fetch(url);

    if (!res.ok) return null;

    const text = await res.text();
    return parseCsvFields(text);
  } catch (e) {
    return null;
  }
}

function parseCsvFields(csv) {
  const [header, ...lines] = csv.trim().split(/\r?\n/);
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
