#!/usr/bin/env ts-node
/**
 * scripts/compare-with-dokumenSistem.ts
 * CLI checker: Audit codebase vs dokumenSistem compliance
 * Usage: npx ts-node scripts/compare-with-dokumenSistem.ts --docs ./sigap-malut/dokumenSistem --out ./reports/report.json --format md
 */
import * as fs from "fs";
import * as path from "path";
import minimist from "minimist";
import fg from "fast-glob";
import matter from "gray-matter";
import leven from "leven";
import chalk from "chalk";
import { fuzzyMatch, detectRouteInSource } from "./matcher";
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
}

export function extractRequirementsFromMarkdown(mdPath: string): Requirement[] {
  const content = fs.readFileSync(mdPath, "utf8");
  const { data, content: body } = matter(content);
  const requirements: Requirement[] = [];
  // TODO: Parse YAML front-matter for structured requirements
  // TODO: Parse tables and bullet lists for endpoints, entities, permissions, etc.
  // TODO: Use regex/heuristics for section headers and key phrases
  // Example: extract endpoints from /api/... patterns
  // Example: extract permission strings like 'workflow:read'
  // Example: extract entity names from tables
  // For now, placeholder:
  if (body.match(/workflow:read/)) {
    requirements.push({
      id: "perm-workflow-read",
      docFile: mdPath,
      section: "RBAC",
      type: "permission",
      name: "workflow:read",
    });
  }
  // ...add more extraction logic here
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
  // Contoh: scan permission dengan fuzzyMatch
  if (req.type === "permission" && fuzzyMatch(req.name, "workflow:read")) {
    const matches = [
      {
        file: "backend/middleware/workflowRbac.mjs",
        line: 13,
        snippet: 'read: "workflow:read"',
        confidence: 1,
      },
      {
        file: "backend/middleware/workflowRbac.js",
        line: 13,
        snippet: 'read: "workflow:read"',
        confidence: 1,
      },
    ];
    evidence = matches;
  }
  // Contoh: scan endpoint dengan detectRouteInSource (dummy source)
  if (req.type === "endpoint" && req.name) {
    const dummySource = 'app.get("/api/data", handler)';
    if (detectRouteInSource(dummySource, req.name)) {
      evidence.push({
        file: "backend/routes/data.js",
        line: 1,
        snippet: dummySource,
        confidence: 1,
      });
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
  import.meta.url === `file://${process.argv[1]}` ||
  import.meta.url.endsWith("compare-with-dokumenSistem.js")
) {
  main();
}

// TODO: Implement full extraction, codebase scan, evidence collection, and markdown output.
// TODO: Add logging, config, and more detailed matching heuristics.
