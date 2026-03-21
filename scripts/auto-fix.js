#!/usr/bin/env ts-node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * scripts/auto-fix.ts
 * CLI: Auto-fix compliance issues based on fix suggestions
 * Usage: npx ts-node scripts/auto-fix.ts --suggestions ./reports/fix-suggestions.json --dry-run
 */
var fs = require("fs");
var path = require("path");
var minimist_1 = require("minimist");
var chalk_1 = require("chalk");
var argv = (0, minimist_1.default)(process.argv.slice(2), {
    string: ["suggestions"],
    boolean: ["dry-run", "verbose"],
    default: {
        suggestions: "./reports/fix-suggestions.json",
        "dry-run": true,
        verbose: false,
    },
});
var SUGGESTIONS_PATH = path.resolve(argv.suggestions);
var DRY_RUN = argv["dry-run"];
var VERBOSE = argv.verbose;
function logInfo(msg) {
    if (VERBOSE)
        console.log(chalk_1.default.blue("[INFO]"), msg);
}
function logWarn(msg) {
    console.warn(chalk_1.default.yellow("[WARN]"), msg);
}
function logError(msg) {
    console.error(chalk_1.default.red("[ERROR]"), msg);
}
function applyFix(suggestion) {
    // Contoh: hanya tampilkan saran, implementasi auto-fix spesifik bisa dikembangkan sesuai kebutuhan
    console.log(chalk_1.default.yellow("[SUGGESTION]"), suggestion.suggestion);
    if (suggestion.evidence && suggestion.evidence.length > 0) {
        suggestion.evidence.forEach(function (ev) {
            console.log("  File: ".concat(ev.file, " | Line: ").concat(ev.line, "\n  Snippet: ").concat(ev.snippet));
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
    logInfo("Membaca suggestions dari ".concat(SUGGESTIONS_PATH));
    if (!fs.existsSync(SUGGESTIONS_PATH)) {
        logError("Suggestions file tidak ditemukan: ".concat(SUGGESTIONS_PATH));
        process.exit(1);
    }
    var suggestions = JSON.parse(fs.readFileSync(SUGGESTIONS_PATH, "utf8"));
    if (suggestions.length === 0) {
        console.log(chalk_1.default.green("Tidak ada saran perbaikan. Codebase sudah compliant!"));
        return;
    }
    suggestions.forEach(applyFix);
    if (DRY_RUN) {
        console.log(chalk_1.default.cyan("[DRY RUN] Tidak ada perubahan file yang dilakukan."));
    }
    else {
        console.log(chalk_1.default.green("Auto-fix selesai. Beberapa file mungkin telah diubah."));
    }
}
if (import.meta.url === "file://".concat(process.argv[1]) || import.meta.url.endsWith("auto-fix.js")) {
    main();
}
