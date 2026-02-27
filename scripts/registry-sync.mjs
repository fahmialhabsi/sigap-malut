import fs from "fs/promises";
import path from "path";

const repoRoot = process.cwd();
const dsePath = path.join(repoRoot, ".dse", "serviceRegistry.json");
const configPath = path.join(repoRoot, "config", "serviceRegistry.json");
const outPath = path.join(repoRoot, ".dse", "registry_sync_report.json");

function indexServices(list) {
  const byModul = new Map();
  const byKode = new Map();
  const arr = Array.isArray(list) ? list : list.services || [];
  for (const s of arr) {
    if (s.modul_ui_id) byModul.set(String(s.modul_ui_id).toLowerCase(), s);
    if (s.kode_layanan) byKode.set(String(s.kode_layanan).toLowerCase(), s);
  }
  return { byModul, byKode };
}

async function loadJson(p) {
  try {
    const raw = await fs.readFile(p, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

function diffService(a, b) {
  const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
  const diffs = {};
  for (const k of keys) {
    const av = a ? a[k] : undefined;
    const bv = b ? b[k] : undefined;
    if (JSON.stringify(av) !== JSON.stringify(bv)) diffs[k] = { a: av, b: bv };
  }
  return diffs;
}

async function main() {
  const dse = await loadJson(dsePath);
  const cfg = await loadJson(configPath);
  const report = { generated_at: new Date().toISOString(), issues: [] };

  if (!dse) report.issues.push({ type: "missing", file: dsePath });
  if (!cfg) report.issues.push({ type: "missing", file: configPath });
  if (!dse || !cfg) {
    await fs.writeFile(outPath, JSON.stringify(report, null, 2));
    console.log("Report written to", outPath);
    process.exit(0);
  }

  const dseIndex = indexServices(dse);
  // config/serviceRegistry.json may be array or object structure
  const cfgList = Array.isArray(cfg) ? cfg : cfg.services || cfg;
  for (const s of cfgList) {
    const modul = s.modul_ui_id ? String(s.modul_ui_id).toLowerCase() : null;
    const kode = s.kode_layanan ? String(s.kode_layanan).toLowerCase() : null;
    let match = null;
    if (modul && dseIndex.byModul.has(modul))
      match = dseIndex.byModul.get(modul);
    else if (kode && dseIndex.byKode.has(kode))
      match = dseIndex.byKode.get(kode);

    if (!match) {
      report.issues.push({
        type: "missing_in_dse",
        service: { kode: s.kode_layanan, modul: s.modul_ui_id },
      });
      continue;
    }

    const diffs = diffService(match, s);
    if (Object.keys(diffs).length)
      report.issues.push({
        type: "mismatch",
        service: { kode: s.kode_layanan, modul: s.modul_ui_id },
        diffs,
      });
  }

  // reverse: items in dse not in config
  const cfgIndex = indexServices({ services: cfgList });
  const dseList = Array.isArray(dse) ? dse : dse.services || [];
  for (const s of dseList) {
    const modul = s.modul_ui_id ? String(s.modul_ui_id).toLowerCase() : null;
    const kode = s.kode_layanan ? String(s.kode_layanan).toLowerCase() : null;
    if (modul && cfgIndex.byModul.has(modul)) continue;
    if (kode && cfgIndex.byKode.has(kode)) continue;
    report.issues.push({
      type: "missing_in_config",
      service: { kode: s.kode_layanan, modul: s.modul_ui_id },
    });
  }

  await fs.writeFile(outPath, JSON.stringify(report, null, 2));
  console.log("Registry sync report written to", outPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
