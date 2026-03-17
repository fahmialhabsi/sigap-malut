#!/usr/bin/env ts-node
/**
 * scripts/auto-fix.ts
 * CLI: Auto-fix compliance issues based on fix suggestions
 * Usage: npx ts-node scripts/auto-fix.ts --suggestions ./reports/fix-suggestions.json --dry-run
 */
import * as fs from "fs";
import * as path from "path";
import minimist from "minimist";
import chalk from "chalk";

const argv = minimist(process.argv.slice(2), {
  string: ["suggestions"],
  boolean: ["dry-run", "verbose"],
  default: {
    suggestions: "./reports/fix-suggestions.json",
    "dry-run": true,
    verbose: false,
  },
});

const SUGGESTIONS_PATH = path.resolve(argv.suggestions);
const DRY_RUN = argv["dry-run"];
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

function applyFix(suggestion: any) {
  // Contoh: hanya tampilkan saran, implementasi auto-fix spesifik bisa dikembangkan sesuai kebutuhan
  console.log(chalk.yellow("[SUGGESTION]"), suggestion.suggestion);
  if (suggestion.evidence && suggestion.evidence.length > 0) {
    suggestion.evidence.forEach((ev: any) => {
      console.log(
        `  File: ${ev.file} | Line: ${ev.line}\n  Snippet: ${ev.snippet}`,
      );
    });
  }
  // Contoh auto-fix: jika ada file dan snippet, bisa lakukan replace/insert (belum diimplementasikan)
  if (!DRY_RUN && suggestion.autoFix) {
    // Implementasi auto-fix spesifik sesuai suggestion.autoFix
    // fs.writeFileSync(...)
    logInfo("Auto-fix dijalankan (belum diimplementasikan)");
  }
}

function main() {
  logInfo(`Membaca suggestions dari ${SUGGESTIONS_PATH}`);
  if (!fs.existsSync(SUGGESTIONS_PATH)) {
    logError(`Suggestions file tidak ditemukan: ${SUGGESTIONS_PATH}`);
    process.exit(1);
  }
  const suggestions = JSON.parse(fs.readFileSync(SUGGESTIONS_PATH, "utf8"));
  if (suggestions.length === 0) {
    console.log(
      chalk.green("Tidak ada saran perbaikan. Codebase sudah compliant!"),
    );
    return;
  }
  suggestions.forEach(applyFix);
  if (DRY_RUN) {
    console.log(
      chalk.cyan("[DRY RUN] Tidak ada perubahan file yang dilakukan."),
    );
  } else {
    console.log(
      chalk.green("Auto-fix selesai. Beberapa file mungkin telah diubah."),
    );
  }
}

if (
  import.meta.url === `file://${process.argv[1]}` ||
  import.meta.url.endsWith("auto-fix.js")
) {
  main();
}
