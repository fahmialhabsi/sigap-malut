import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repo = path.resolve(path.join(__dirname, "..", ".."));
const master = path.join(repo, "master-data");
const modelsDir = path.join(repo, "backend", "models");
const controllersDir = path.join(repo, "backend", "controllers");
const routesDir = path.join(repo, "backend", "routes");

function listCsvBases(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".csv"))
    .map((f) =>
      f
        .replace(/_fields\.csv$/i, "")
        .replace(/_fields/i, "")
        .replace(/\.csv$/i, ""),
    );
}

const folders = [
  "FIELDS",
  "FIELDS_SEKRETARIAT",
  "FIELDS_BIDANG_KETERSEDIAAN",
  "FIELDS_BIDANG_DISTRIBUSI",
  "FIELDS_BIDANG_KONSUMSI",
  "FIELDS_UPTD",
];

const missing = [];
const report = {};
for (const f of folders) {
  const dir = path.join(master, f);
  const bases = listCsvBases(dir);
  report[f] = { total: bases.length, items: [] };
  for (const b of bases) {
    const modelName = `${b}.js`;
    const controllerName = `${b}.js`;
    const routeName = `${b}.js`;
    const hasModel = fs.existsSync(path.join(modelsDir, modelName));
    const hasController = fs.existsSync(
      path.join(controllersDir, controllerName),
    );
    const hasRoute = fs.existsSync(path.join(routesDir, routeName));
    const item = { base: b, hasModel, hasController, hasRoute };
    report[f].items.push(item);
    if (!hasModel || !hasController || !hasRoute) missing.push(item);
  }
}

console.log(JSON.stringify({ report, missing }, null, 2));
