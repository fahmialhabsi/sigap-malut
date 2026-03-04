// utils/fieldMapping.js
// Auto-sync field mapping dari master-data/*.csv ke modul UI

export async function fetchFieldMapping(modulId) {
  // Try multiple locations/patterns for robustness:
  // 1. Backend host via VITE_API_URL (recommended in dev)
  // 2. Upper/lower-case variations
  // 3. Relative path (works when static files are served by same origin)
  const envBase = (import.meta.env && import.meta.env.VITE_API_URL) || "";
  const candidates = [];

  const normalized = String(modulId).toUpperCase();
  if (envBase) {
    candidates.push(
      `${envBase.replace(/\/$/, "")}/master-data/FIELDS/FIELDS_${normalized}.csv`,
    );
    candidates.push(
      `${envBase.replace(/\/$/, "")}/master-data/FIELDS/FIELDS_${modulId}.csv`,
    );
  }

  // relative fallbacks (served by frontend/public or dev server)
  candidates.push(`/master-data/FIELDS/FIELDS_${normalized}.csv`);
  candidates.push(`/master-data/FIELDS/FIELDS_${modulId}.csv`);

  for (const url of candidates) {
    try {
      if (import.meta.env && import.meta.env.MODE === "development")
        console.debug("fetchFieldMapping: trying", url);
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("text/html")) continue;
      const text = await res.text();
      if (
        !text ||
        text.trim().length === 0 ||
        text.trim().startsWith("<!doctype html") ||
        text.trim().startsWith("<html")
      )
        continue;
      if (import.meta.env && import.meta.env.MODE === "development")
        console.debug("fetchFieldMapping: success", url);
      return parseCsvFields(text);
    } catch (e) {
      if (import.meta.env && import.meta.env.MODE === "development")
        console.debug("fetchFieldMapping: error", url, e && e.message);
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
