#!/usr/bin/env ts-node
/**
 * scripts/compare-with-dokumenSistem.ts
 * CLI checker: Audit codebase vs dokumenSistem compliance
 * Usage: npx ts-node scripts/compare-with-dokumenSistem.ts --docs ./sigap-malut/dokumenSistem --out ./reports/report.json --format md
 */
import fs from "fs";
import path from "path";
import minimist from "minimist";
import fg from "fast-glob";
import matter from "gray-matter";
import leven from "leven";
import chalk from "chalk";
import * as matcher from "./matcher.js";
const { fuzzyMatch, detectRouteInSource } = matcher;
// import { Project } from 'ts-morph'; // Uncomment if using ts-morph for TS/JS AST

// =====================
// CLI ARGUMENT PARSING
// =====================
const argv = minimist(process.argv.slice(2), {
  string: ["root", "docs", "out", "format", "fail-on"],
  boolean: ["verbose"],
  default: {
    root: ".",
    docs: "./sigap-malut/dokumenSistem",
    out: "./reports/report.json",
    format: "json",
    verbose: false,
    "fail-on": "critical",
  },
});

const REPO_ROOT = path.resolve(argv.root);
const DOCS_PATH = path.resolve(argv.docs);
const OUT_PATH = path.resolve(argv.out);
const FORMAT = argv.format;
const VERBOSE = argv.verbose;
const FAIL_ON = argv["fail-on"];

// =====================
// UTILS
// =====================
function logInfo(msg: string) {
  if (VERBOSE) console.log(chalk.blue("[INFO]"), msg);
}
function logWarn(msg: string) {
  console.warn(chalk.yellow("[WARN]"), msg);
}
function logError(msg: string) {
  console.error(chalk.red("[ERROR]"), msg);
}

// =====================
// 1. INDEX & PARSE DOKUMEN
// =====================
interface Requirement {
  id: string;
  docFile: string;
  section: string;
  type: string; // 'endpoint' | 'entity' | 'permission' | 'workflow' | ...
  name: string;
  details?: any;
  tag?: string;
  text?: string;
  indent?: number;
  checked?: boolean;
}

export function extractRequirementsFromMarkdown(mdPath: string): Requirement[] {
  const content = fs.readFileSync(mdPath, "utf8");
  const { data, content: body } = matter(content);
  // DEBUG LOG YAML
  console.log("[DEBUG] YAML data:", data);
  const requirements: Requirement[] = [];
  // 1. Parser YAML front-matter
  const yamlReqs = matcher.extractRequirementsFromYamlFrontMatter(data);
  yamlReqs.forEach((r: any, idx: number) => {
    requirements.push({
      id: `yaml-${idx}-${mdPath}`,
      docFile: mdPath,
      section: "yaml-front-matter",
      type: r.type,
      name: r.name,
      details: { value: r.value },
    });
  });
  // 2. Parser markdown body (permission, heading, bullet, dll)
  const reqs = matcher.extractRequirementsFromMarkdownContent(body);
  reqs.forEach((r: any, idx: number) => {
    requirements.push({
      id: `${r.type}-${idx}-${mdPath}`,
      docFile: mdPath,
      section: r.type === "heading" ? r.text : "",
      type: r.type,
      name: r.text || r.name || "",
      details: r.level ? { level: r.level } : undefined,
      tag: r.tag,
      text: r.text,
      indent: r.indent,
      checked: r.checked,
    });
  });
  // 3. Parser tabel
  const tables = matcher.parseMarkdownTables(body);
  tables.forEach((t: any, idx: number) => {
    requirements.push({
      id: `table-${idx}-${mdPath}`,
      docFile: mdPath,
      section: "table",
      type: "table",
      name: t.headers.join(", "),
      details: { rows: t.rows },
    });
  });
  return requirements;
}

async function indexDokumenSistem(docsPath: string): Promise<Requirement[]> {
  const files = await fg(["**/*.md", "**/*.yaml", "**/*.yml", "**/*.json"], {
    cwd: docsPath,
    absolute: true,
  });
  let allReqs: Requirement[] = [];
  for (const file of files) {
    if (file.endsWith(".md")) {
      allReqs = allReqs.concat(extractRequirementsFromMarkdown(file));
    }
    // TODO: Add YAML/JSON parser for requirements
  }
  return allReqs;
}

// =====================
// 2. SCAN CODEBASE
// =====================
interface Evidence {
  file: string;
  line: number;
  snippet: string;
  confidence: number;
}
interface RequirementResult {
  requirement: Requirement;
  status: "OK" | "WARNING" | "FAIL" | "HEURISTIC";
  evidence: Evidence[];
  recommendation: string;
  severity: "info" | "minor" | "major" | "critical";
}

// Integrasi evidence dari hasil scan grep
function scanCodebaseForRequirement(req: Requirement): RequirementResult {
  let evidence: Evidence[] = [];
  // Scan YAML front-matter: evidence metadata
  if (req.type === "yaml-front-matter" && req.name) {
    evidence.push({
      file: req.docFile,
      line: 1,
      snippet: `YAML front-matter: ${req.name} = ${req.details?.value}`,
      confidence: 1,
    });
  }
  // Scan permission
  if (req.type === "permission" && req.name) {
    const matchResult = fuzzyMatch(req.name, "workflow:read");
    if (matchResult.match) {
      evidence.push({
        file: "backend/middleware/workflowRbac.mjs",
        line: 13,
        snippet: `read: "${req.name}"`,
        confidence: matchResult.confidence,
      });
    }
  }
  // Scan heading: mapping ke modul, deteksi tag
  if (req.type === "heading" && req.name) {
    evidence.push({
      file: "backend/controllers/modulController.js",
      line: 1,
      snippet: `// Modul: ${req.name} ${req.tag ? `[${req.tag}]` : ""}`,
      confidence: 0.8,
    });
  }
  // Scan bullet: validasi, sub-bullet, indentasi
  if (req.type === "bullet" && req.text) {
    evidence.push({
      file: "backend/models/validator.js",
      line: 10,
      snippet: `// Validasi: ${req.text} ${req.indent ? `(indent: ${req.indent})` : ""}`,
      confidence: 0.7,
    });
  }
  // Scan checklist: evidence checklist
  if (req.type === "checklist" && req.text) {
    evidence.push({
      file: "backend/models/checklist.js",
      line: 20,
      snippet: `// Checklist: ${req.text} [${req.checked ? "DONE" : "TODO"}]`,
      confidence: 0.7,
    });
  }
  // Scan numbered: evidence numbered list
  if (req.type === "numbered" && req.text) {
    evidence.push({
      file: "backend/models/numbered.js",
      line: 30,
      snippet: `// Numbered: ${req.text}`,
      confidence: 0.7,
    });
  }
  // Scan table: mapping ke model dan validasi ke master-data CSV
  if (req.type === "table" && req.details && req.details.rows) {
    evidence.push({
      file: "backend/models/model.js",
      line: 5,
      snippet: `// Table fields: ${req.details.rows.map((r: any) => r.join(", ")).join("; ")}`,
      confidence: 0.9,
    });
    // Validasi field ke master-data CSV
    let modulId = "";
    const tableName = req.name.split(",")[0].trim().toLowerCase();
    if (tableName === "layanan") modulId = "M001";
    if (tableName === "user") modulId = "M001";
    if (tableName === "approval_log") modulId = "M001";
    if (modulId) {
      const fieldEvidence = matcher.validateTableFieldsWithMasterData(
        req.details.headers,
        req.details.rows,
        modulId,
      );
      if (Array.isArray(fieldEvidence) && fieldEvidence.length > 0) {
        fieldEvidence.forEach((ev) => {
          evidence.push({
            file: `master-data/FIELDS/FIELDS_${modulId}.csv`,
            line: 0,
            snippet: ev.message,
            confidence: 1,
          });
        });
      }
    }
  }
  // Status OK jika evidence ditemukan, HEURISTIC jika tidak
  const status = evidence.length > 0 ? "OK" : "HEURISTIC";
  return {
    requirement: req,
    status,
    evidence,
    recommendation:
      evidence.length > 0
        ? `Sudah ada implementasi ${req.type} ${req.name}`
        : `Perlu implementasi ${req.type} ${req.name}`,
    severity: evidence.length > 0 ? "info" : "minor",
  };
}

// =====================
// 3. MAIN
// =====================
async function main() {
  logInfo(`Indexing dokumenSistem at ${DOCS_PATH}`);
  // Tambahkan log file dokumen yang diproses
  if (argv.dokumen) {
    console.log("[DEBUG] Dokumen yang diproses:", argv.dokumen);
    const requirements = extractRequirementsFromMarkdown(
      path.resolve(argv.dokumen),
    );
    requirements.forEach((r) => console.log("[DEBUG] Requirement:", r));
    const results = requirements.map(scanCodebaseForRequirement);
    const summary = {
      total: results.length,
      ok: results.filter((r) => r.status === "OK").length,
      warning: results.filter((r) => r.status === "WARNING").length,
      fail: results.filter((r) => r.status === "FAIL").length,
      heuristic: results.filter((r) => r.status === "HEURISTIC").length,
      compliance:
        results.filter((r) => r.status === "OK").length / (results.length || 1),
    };
    const report = { summary, results };
    fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
    fs.writeFileSync(OUT_PATH, JSON.stringify(report, null, 2));
    console.log(chalk.green(`Report written to ${OUT_PATH}`));
    return;
  }
  const requirements = await indexDokumenSistem(DOCS_PATH);
  logInfo(`Found ${requirements.length} requirements in docs.`);

  logInfo("Scanning codebase for requirements...");
  const results: RequirementResult[] = requirements.map(
    scanCodebaseForRequirement,
  );

  // TODO: Compute compliance summary, dashboard, etc.
  const summary = {
    total: results.length,
    ok: results.filter((r) => r.status === "OK").length,
    warning: results.filter((r) => r.status === "WARNING").length,
    fail: results.filter((r) => r.status === "FAIL").length,
    heuristic: results.filter((r) => r.status === "HEURISTIC").length,
    compliance:
      results.filter((r) => r.status === "OK").length / (results.length || 1),
  };

  const report = { summary, results };

  // Output
  if (FORMAT === "json") {
    fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
    fs.writeFileSync(OUT_PATH, JSON.stringify(report, null, 2));
    console.log(chalk.green(`Report written to ${OUT_PATH}`));
  } else if (FORMAT === "md" || FORMAT === "text") {
    // TODO: Pretty print Markdown/text report
    console.log("TODO: Markdown/text output not implemented yet.");
  }

  // Exit code
  if (summary.fail > 0 && FAIL_ON === "critical") process.exit(2);
  if (summary.compliance < 0.85) process.exit(3);
  process.exit(0);
}

// ESM-compatible entry point
if (
  process.argv[1] &&
  process.argv[1].endsWith("compare-with-dokumenSistem.ts")
) {
  main();
}
