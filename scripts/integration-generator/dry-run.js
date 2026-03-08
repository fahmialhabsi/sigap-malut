import fs from "fs/promises";
import path from "path";

const workspaceRoot = process.cwd();
const backendDir = path.join(workspaceRoot, "backend");
const backupsDir = path.join(
  workspaceRoot,
  ".dse",
  "backups",
  "integration-dry-run",
);
const patchesDir = path.join(backupsDir, "patches");

function isJsFile(file) {
  return file.endsWith(".js");
}

async function ensureDirs() {
  await fs.mkdir(patchesDir, { recursive: true });
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (["node_modules", ".git", "coverage"].includes(e.name)) continue;
      files.push(...(await walk(full)));
    } else if (e.isFile() && isJsFile(e.name)) {
      files.push(full);
    }
  }
  return files;
}

function findRequires(src) {
  const results = [];
  // matches: const X = require('y') OR let/var
  const requireRe =
    /(^|\n)\s*(?:const|let|var)\s+([\w$\{\},\s:\.]+)\s*=\s*require\(['"]([^'"]+)['"]\)\s*;?/g;
  let m;
  while ((m = requireRe.exec(src)) !== null) {
    results.push({ full: m[0].trim(), left: m[2].trim(), mod: m[3].trim() });
  }
  // matches module.exports = ...
  const modExpRe = /(^|\n)\s*module\.exports\s*=\s*([\s\S]*?);?(?=\n|$)/g;
  const exports = [];
  while ((m = modExpRe.exec(src)) !== null) {
    exports.push({ full: m[0].trim(), right: m[2].trim() });
  }
  return { requires: results, moduleExports: exports };
}

function suggestImportLine(req) {
  // basic heuristics
  const left = req.left;
  const mod = req.mod;
  // destructured require like { v4: uuidv4 }
  if (left.startsWith("{")) {
    return `import ${left} from '${mod}';`;
  }
  // aliasing: const { v4: uuidv4 } = require('uuid') handled above
  return `import ${left} from '${mod}';`;
}

function suggestExportLine(exp) {
  const right = exp.right;
  // heuristics: if right starts with '{' it's an object literal
  if (right.trim().startsWith("{")) {
    return `export ${right};`;
  }
  // if it's an identifier or function expression, suggest default export
  return `export default ${right};`;
}

function makePatch(original, suggestions) {
  const parts = [];
  parts.push("--- original");
  parts.push(original);
  parts.push("+++ suggestion");
  parts.push(suggestions);
  return parts.join("\n\n");
}

async function run() {
  console.log(
    "Integration dry-run start — scanning backend/ for CommonJS patterns...",
  );
  await ensureDirs();
  const files = await walk(backendDir).catch((err) => {
    console.error("walk error", err);
    return [];
  });
  const report = {
    scanned: files.length,
    timestamp: new Date().toISOString(),
    files: [],
  };

  for (const f of files) {
    const rel = path.relative(workspaceRoot, f).replace(/\\/g, "/");
    // skip migrations with .cjs (we only scanned .js)
    try {
      const src = await fs.readFile(f, "utf8");
      const found = findRequires(src);
      if (found.requires.length === 0 && found.moduleExports.length === 0)
        continue;
      const fileReport = {
        file: rel,
        requires: found.requires.length,
        moduleExports: found.moduleExports.length,
        notes: [],
      };
      let suggestionText = "";
      for (const r of found.requires) {
        const imp = suggestImportLine(r);
        fileReport.notes.push({
          type: "require",
          original: r.full,
          suggestion: imp,
        });
        suggestionText += `// replace: ${r.full}\n${imp}\n\n`;
      }
      for (const e of found.moduleExports) {
        const ex = suggestExportLine(e);
        fileReport.notes.push({
          type: "module.exports",
          original: e.full,
          suggestion: ex,
        });
        suggestionText += `// replace: ${e.full}\n${ex}\n\n`;
      }

      // write patch preview
      const patchContent = makePatch(src.slice(0, 3000), suggestionText);
      const patchFileName = rel.replace(/\//g, "__") + ".patch.txt";
      const patchPath = path.join(patchesDir, patchFileName);
      await fs.writeFile(patchPath, patchContent, "utf8");
      fileReport.patch = path
        .relative(workspaceRoot, patchPath)
        .replace(/\\/g, "/");
      report.files.push(fileReport);
    } catch (err) {
      console.error("read/parse error", f, err.message);
    }
  }

  const reportPath = path.join(backupsDir, "integration-dry-run-report.json");
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");
  console.log(
    "Dry-run report written to",
    path.relative(workspaceRoot, reportPath),
  );
  console.log(
    "Patch previews written to",
    path.relative(workspaceRoot, patchesDir),
  );

  // create docker-compose draft
  const composeDraft = `version: '3.8'\nservices:\n  db:\n    image: postgres:15\n    environment:\n      POSTGRES_USER: postgres\n      POSTGRES_PASSWORD: postgres\n      POSTGRES_DB: sigap_malut_dev\n    ports:\n      - \"5432:5432\"\n    volumes:\n      - db_data:/var/lib/postgresql/data\n\n  adminer:\n    image: adminer\n    restart: always\n    ports:\n      - \"8080:8080\"\n\nvolumes:\n  db_data:\n`;
  const composePath = path.join(
    backupsDir,
    "docker-compose.postgres.dry-run.yml",
  );
  await fs.writeFile(composePath, composeDraft, "utf8");

  console.log(
    "Docker Compose draft created at",
    path.relative(workspaceRoot, composePath),
  );
  console.log(
    "Dry-run completed. Review the patches in .dse/backups/integration-dry-run/patches and the report.",
  );
}

if (process.argv.includes("--help")) {
  console.log("Usage: node dry-run.js");
  process.exit(0);
}

run().catch((err) => {
  console.error("Fatal", err);
  process.exit(1);
});
