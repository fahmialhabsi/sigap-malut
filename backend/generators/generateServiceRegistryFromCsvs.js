import fs from "fs/promises";
import path from "path";

function parseCsv(content) {
  const lines = content.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length === 0) return [];
  const header = lines[0].split(",").map((h) => h.trim());
  const rows = lines.slice(1).map((line) => {
    // simple CSV split (no quoted commas expected in these files)
    const cols = line.split(",");
    const obj = {};
    for (let i = 0; i < header.length; i++) {
      obj[header[i]] = (cols[i] || "").trim();
    }
    return obj;
  });
  return rows;
}

async function main() {
  const repoRoot = path.resolve(process.cwd());
  const mdDir = path.join(repoRoot, "master-data");
  const outPath = path.join(repoRoot, "config", "serviceRegistry.json");

  const files = await fs.readdir(mdDir);
  const layananFiles = files.filter((f) => /LAYANAN/i.test(f));
  const registry = [];

  for (const f of layananFiles) {
    const full = path.join(mdDir, f);
    try {
      const raw = await fs.readFile(full, "utf8");
      const rows = parseCsv(raw);
      for (const r of rows) {
        if (!r.layanan_id) continue;
        const item = {
          id_layanan: r.layanan_id,
          kode_layanan:
            r.layanan_code ||
            r.layanan_code ||
            (r.layanan_id || "").toLowerCase(),
          nama_layanan: r.layanan_name || r.layanan_name || "",
          modul_ui_id: r.modul_ui_id || "",
          is_sensitive: r.is_sensitive || r.sensitif || "",
          bidang_penanggung_jawab: r.modul_ui_id || "",
          penanggung_jawab: r.penanggung_jawab || "",
          pelaksana: r.pelaksana || "",
          status_aktif: r.status_aktif === "true" || r.status_aktif === "1",
          menu_order: Number(r.menu_order || 0),
          workflow: r.layanan_code
            ? `${r.layanan_code}_workflow`
            : `${(r.layanan_id || "").toLowerCase()}_workflow`,
          source: path.join("master-data", f),
        };
        registry.push(item);
      }
    } catch (err) {
      console.warn("Failed to read", full, err.message);
    }
  }

  // write sorted by id_layanan
  registry.sort((a, b) =>
    (a.id_layanan || "").localeCompare(b.id_layanan || ""),
  );
  await fs.writeFile(outPath, JSON.stringify(registry, null, 2), "utf8");
  console.log(
    "Wrote serviceRegistry with",
    registry.length,
    "entries to",
    outPath,
  );
}

if (process.argv[1].endsWith("generateServiceRegistryFromCsvs.js")) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

export default main;
