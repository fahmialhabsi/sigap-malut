import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MASTER_CONFIG_PATH = path.resolve(
  __dirname,
  "../../master-data/00_MASTER_MODUL_CONFIG.csv",
);
const SCHEMA_PATH = path.resolve(__dirname, "../database/schema");
const OUTPUT_PATH = path.resolve(__dirname, "../../docs/laporan-modul.md");

const TABLE_ALIASES = {
  komoditas: "master_komoditas",
  kabupaten: "master_kabupaten",
};

function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (error) => reject(error));
  });
}

function loadSchemaTables() {
  return new Set(
    fs
      .readdirSync(SCHEMA_PATH)
      .filter((file) => file.endsWith(".sql"))
      .map((file) => file.replace(/\.sql$/i, "")),
  );
}

function resolveAlias(tableName, schemaTables) {
  const alias = TABLE_ALIASES[tableName] || null;
  if (!alias) return null;

  return schemaTables.has(alias) ? alias : null;
}

function buildReport(modules, schemaTables) {
  const rows = modules.map((row) => {
    const tableName = row.tabel_name?.trim();
    const hasSchema = tableName && schemaTables.has(tableName);
    const alias = tableName ? resolveAlias(tableName, schemaTables) : null;
    const resolvedTable = hasSchema ? tableName : alias;
    const status = hasSchema ? "schema" : alias ? "alias" : "missing";

    return {
      modul_id: row.modul_id,
      nama_modul: row.nama_modul,
      bidang: row.bidang,
      tabel_name: tableName || "",
      status,
      resolved_table: resolvedTable || "",
    };
  });

  const summary = rows.reduce(
    (acc, row) => {
      acc[row.status] += 1;
      return acc;
    },
    { schema: 0, alias: 0, missing: 0 },
  );

  let report = "# Laporan Modul & Tabel\n\n";
  report += `- Total modul: ${rows.length}\n`;
  report += `- Tabel tersedia: ${summary.schema}\n`;
  report += `- Tabel via alias: ${summary.alias}\n`;
  report += `- Tabel belum ada: ${summary.missing}\n\n`;

  report +=
    "| modul_id | nama_modul | bidang | tabel_name | status | resolved_table |\n";
  report += "| --- | --- | --- | --- | --- | --- |\n";

  for (const row of rows) {
    report += `| ${row.modul_id} | ${row.nama_modul} | ${row.bidang} | ${row.tabel_name} | ${row.status} | ${row.resolved_table} |\n`;
  }

  return report;
}

async function main() {
  const schemaTables = loadSchemaTables();
  const modules = await readCSV(MASTER_CONFIG_PATH);
  const report = buildReport(modules, schemaTables);

  fs.writeFileSync(OUTPUT_PATH, report);
  console.log(`✅ Laporan tersimpan: ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error("❌ Gagal membuat laporan:", error.message);
  process.exit(1);
});
