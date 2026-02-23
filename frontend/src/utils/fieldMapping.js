// utils/fieldMapping.js
// Auto-sync field mapping dari master-data/*.csv ke modul UI

export async function fetchFieldMapping(modulId) {
  // Asumsi: file CSV field mapping disimpan di /master-data/FIELDS/ atau subfolder
  // dan penamaan file: FIELDS_<MODULID>.csv atau FIELDS_<BIDANG>/<MODULID>.csv
  // Untuk demo, hanya fetch satu file statis. Untuk produksi, bisa pakai API/backend.
  try {
    const res = await fetch(`/master-data/FIELDS/FIELDS_${modulId}.csv`);
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
    keys.forEach(
      (k, i) =>
        (obj[k.trim()] = (values[i] || "").replace(/^"|"$/g, "").trim()),
    );
    return obj;
  });
}
