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
  // Tampilkan saran
  console.log(chalk.yellow("[SUGGESTION]"), suggestion.suggestion);
  if (suggestion.evidence && suggestion.evidence.length > 0) {
    suggestion.evidence.forEach((ev: any) => {
      console.log(
        `  File: ${ev.file} | Line: ${ev.line}\n  Snippet: ${ev.snippet}`,
      );
      if (!DRY_RUN) {
        // Auto-fix berdasarkan jenis file
        if (
          ev.file &&
          ev.file.endsWith(".csv") &&
          ev.snippet &&
          ev.snippet.includes("tidak ditemukan di master-data CSV")
        ) {
          // Fix CSV: tambahkan field baru
          const match = ev.snippet.match(/Field '(.+?)'/);
          const fieldName = match ? match[1] : null;
          if (fieldName) {
            const csvPath = path.resolve(ev.file);
            let csvContent = fs.readFileSync(csvPath, "utf8");
            const newRow = `\n${fieldName},${fieldName},varchar,255,false,false,NULL,none,NULL,Auto-fix generated`;
            csvContent += newRow;
            fs.writeFileSync(csvPath, csvContent);
            logInfo(`Field '${fieldName}' ditambahkan ke ${csvPath}`);
          }
        } else if (
          ev.file &&
          ev.file.endsWith(".js") &&
          ev.snippet &&
          ev.snippet.includes("field tidak ditemukan")
        ) {
          // Fix Model: tambahkan field ke Sequelize model
          const match = ev.snippet.match(/Field '(.+?)'/);
          const fieldName = match ? match[1] : null;
          if (fieldName) {
            const modelPath = path.resolve(ev.file);
            let modelContent = fs.readFileSync(modelPath, "utf8");
            // Cari bagian fields definition dan tambahkan field baru
            const fieldDefinition = `      ${fieldName}: {\n        type: DataTypes.STRING(255),\n        allowNull: true,\n        comment: 'Auto-fix generated'\n      },`;
            // Insert sebelum closing bracket
            const insertPoint = modelContent.lastIndexOf("    }");
            if (insertPoint !== -1) {
              modelContent =
                modelContent.slice(0, insertPoint) +
                fieldDefinition +
                "\n" +
                modelContent.slice(insertPoint);
              fs.writeFileSync(modelPath, modelContent);
              logInfo(`Field '${fieldName}' ditambahkan ke model ${modelPath}`);
            }
          }
        } else if (
          ev.file &&
          ev.file.endsWith(".js") &&
          ev.snippet &&
          ev.snippet.includes("route tidak ditemukan")
        ) {
          // Fix Route: tambahkan route baru
          const match = ev.snippet.match(/Route '(.+?)'/);
          const routePath = match ? match[1] : null;
          if (routePath) {
            const routeFilePath = path.resolve(ev.file);
            let routeContent = fs.readFileSync(routeFilePath, "utf8");
            // Tambahkan route baru
            const newRoute = `\nrouter.get('${routePath}', (req, res) => {\n  res.json({ message: 'Auto-fix generated route' });\n});`;
            routeContent += newRoute;
            fs.writeFileSync(routeFilePath, routeContent);
            logInfo(`Route '${routePath}' ditambahkan ke ${routeFilePath}`);
          }
        }
      }
    });
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
