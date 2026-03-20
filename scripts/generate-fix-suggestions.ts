#!/usr/bin/env ts-node
/**
 * scripts/generate-fix-suggestions.ts
 * CLI: Generate fix suggestions based on compliance report
 * Usage: npx ts-node scripts/generate-fix-suggestions.ts --report ./reports/report.json --out ./reports/fix-suggestions.json --format json
 */
import * as fs from "fs";
import * as path from "path";
import minimist from "minimist";
import chalk from "chalk";

const argv = minimist(process.argv.slice(2), {
  string: ["report", "out", "format"],
  boolean: ["verbose"],
  default: {
    report: "./reports/report.json",
    out: "./reports/fix-suggestions.json",
    format: "json",
    verbose: false,
  },
});

const REPORT_PATH = path.resolve(argv.report);
const OUT_PATH = path.resolve(argv.out);
const FORMAT = argv.format;
const VERBOSE = argv.verbose;

function logInfo(msg: string) {
  if (VERBOSE) console.log(chalk.blue("[INFO]"), msg);
}
function logWarn(msg: string) {
  console.warn(chalk.yellow("[WARN]"), msg);
}
function logError(msg: string) {
  console.error(chalk.red("[ERROR]"), msg);
}

interface RequirementResult {
  requirement: any;
  status: string;
  evidence: any[];
  recommendation: string;
  severity: string;
}

function generateFixSuggestions(report: { results: RequirementResult[] }) {
  const suggestions = report.results
    .filter((r) => r.status !== "OK")
    .map((r) => {
      // Tambahan: jika evidence ada field NOT_FOUND dari master-data, buat saran spesifik
      let suggestion =
        r.recommendation || `Perbaiki requirement: ${r.requirement.name}`;
      if (r.evidence && Array.isArray(r.evidence)) {
        const notFoundFields = r.evidence.filter(
          (ev) =>
            ev.snippet &&
            ev.snippet.includes("tidak ditemukan di master-data CSV"),
        );
        if (notFoundFields.length > 0) {
          suggestion =
            `Tambahkan field berikut ke master-data CSV modul terkait: ` +
            notFoundFields
              .map((ev) => ev.snippet.match(/Field '(.+?)'/)?.[1])
              .filter(Boolean)
              .join(", ");
        }
      }
      return {
        requirement: r.requirement,
        severity: r.severity,
        suggestion,
        evidence: r.evidence,
      };
    });
  return suggestions;
}

function main() {
  logInfo(`Membaca report dari ${REPORT_PATH}`);
  if (!fs.existsSync(REPORT_PATH)) {
    logError(`Report tidak ditemukan: ${REPORT_PATH}`);
    process.exit(1);
  }
  const report = JSON.parse(fs.readFileSync(REPORT_PATH, "utf8"));
  const suggestions = generateFixSuggestions(report);

  if (FORMAT === "json") {
    fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
    fs.writeFileSync(OUT_PATH, JSON.stringify(suggestions, null, 2));
    console.log(chalk.green(`Fix suggestions ditulis ke ${OUT_PATH}`));
  } else {
    // TODO: Tambahkan output format lain jika diperlukan
    console.log(suggestions);
  }
}

if (
  import.meta.url === `file://${process.argv[1]}` ||
  import.meta.url.endsWith("generate-fix-suggestions.js")
) {
  main();
}
