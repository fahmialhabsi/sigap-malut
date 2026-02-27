import fs from "fs/promises";
import path from "path";

const repoRoot = process.cwd();
const erdPath = path.join(repoRoot, "dokumenSistem", "10-ERD-Logical-Model.md");
const schemaDir = path.join(repoRoot, "backend", "database", "schema");
const outPath = path.join(repoRoot, ".dse", "erd_schema_report.json");

async function loadErdEntities(p) {
  try {
    const txt = await fs.readFile(p, "utf8");
    const lines = txt.split(/\r?\n/);
    const entities = [];
    for (const l of lines) {
      const m = l.match(/^\-\s+([a-zA-Z0-9_ ]+)\s*(?:\(|$)/);
      if (m) entities.push(m[1].trim());
    }
    return entities.map((e) => e.toLowerCase());
  } catch (e) {
    return [];
  }
}

async function loadSchemaTables(dir) {
  const files = await fs.readdir(dir).catch(() => []);
  const tables = {};
  for (const f of files) {
    if (!f.endsWith(".sql")) continue;
    const txt = await fs.readFile(path.join(dir, f), "utf8");
    const m =
      txt.match(/CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+([a-z0-9_]+)/i) ||
      txt.match(/CREATE\s+TABLE\s+([a-z0-9_]+)/i);
    if (m) {
      const tname = m[1].toLowerCase();
      const cols = Array.from(
        txt.matchAll(/\n\s*([a-z0-9_]+)\s+[A-Z\(]/gi),
      ).map((x) => x[1].toLowerCase());
      tables[tname] = { file: f, columns: cols };
    }
  }
  return tables;
}

function mapErdToTableName(e) {
  // simple heuristics
  const s = e.replace(/\s+/g, "_").toLowerCase();
  if (s === "user") return "users";
  if (s === "approval_log") return "approval_log";
  if (s === "layanan") return "layanan" || "services";
  return s;
}

async function main() {
  const entities = await loadErdEntities(erdPath);
  const tables = await loadSchemaTables(schemaDir);
  const report = {
    generated_at: new Date().toISOString(),
    entities: {},
    missing_tables: [],
    table_samples: {},
  };

  for (const e of entities) {
    const t = mapErdToTableName(e);
    if (tables[t])
      report.entities[e] = {
        table: t,
        found: true,
        file: tables[t].file,
        columns: tables[t].columns,
      };
    else report.entities[e] = { table: t, found: false };
  }

  // also list some important tables that exist
  for (const [k, v] of Object.entries(tables)) {
    report.table_samples[k] = { file: v.file, columns_count: v.columns.length };
  }

  await fs.writeFile(outPath, JSON.stringify(report, null, 2));
  console.log("ERD vs schema report written to", outPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
