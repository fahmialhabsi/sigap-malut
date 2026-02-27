// utils/fieldMapping.js
// Auto-sync field mapping dari master-data/*.csv ke modul UI

export async function fetchFieldMapping(modulId) {
  // Asumsi: file CSV field mapping disimpan di /master-data/FIELDS/ atau subfolder
  // Preferensi: file bernama `SA09_fields.csv` / `SA10_fields.csv` (moduleId like 'sa09')
  // Fallback: older pattern `FIELDS_<modulId>.csv`.
  const candidates = [
    `/master-data/FIELDS/${modulId.toUpperCase()}_fields.csv`,
    `/master-data/FIELDS/FIELDS_${modulId}.csv`,
  ];

  for (const path of candidates) {
    try {
      const res = await fetch(path);
      if (!res.ok) continue;
      const text = await res.text();
      return parseCsvFields(text);
    } catch (e) {
      // try next candidate
      continue;
    }
  }

  return null;
}

function parseCsvFields(csv) {
  const [header, ...lines] = csv.trim().split(/\r?\n/);
  const keys = header.split(",");
  return lines.map((line) => {
    const values = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/); // handle koma dalam kutip
    const obj = {};
    keys.forEach(
      (k, i) =>
        (obj[k.trim()] = (values[i] || "").replace(/^"|"$/g, "").trim()),
    );
    return obj;
  });
}
