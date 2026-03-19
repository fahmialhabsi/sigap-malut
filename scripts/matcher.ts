// Parser YAML front-matter (menggunakan gray-matter)
export function extractRequirementsFromYamlFrontMatter(data: any): any[] {
  const requirements: any[] = [];
  if (!data || typeof data !== "object") return requirements;
  // Contoh: ambil semua key-value sebagai requirement
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      requirements.push({
        type: "yaml-front-matter",
        name: key,
        value: data[key],
      });
    }
  }
  return requirements;
}
import fs = require("fs");
import path = require("path");
import { parse as csvParse } from "csv-parse/sync";

// Validasi field tabel Markdown ke master-data CSV
export function validateTableFieldsWithMasterData(
  tableHeaders: any,
  tableRows: any,
  modulId: string,
) {
  // Cari file CSV master-data berdasarkan modulId
  const csvPath = path.resolve(
    __dirname,
    `../master-data/FIELDS/FIELDS_${modulId}.csv`,
  );
  let csvFields: string[] = [];
  try {
    const csvContent = fs.readFileSync(csvPath, "utf8");
    const records: any[] = csvParse(csvContent, {
      columns: true,
      skip_empty_lines: true,
    });
    csvFields = Array.isArray(records)
      ? records.map((r: any) => r.field_name)
      : [];
  } catch (e) {
    return { error: `Master-data CSV not found for ${modulId}` };
  }
  // Validasi setiap field dari tabel Markdown
  const evidence: any[] = [];
  tableRows.forEach((row: any) => {
    const field = row[0]; // Asumsi kolom pertama adalah field_name
    if (field && !csvFields.includes(field)) {
      evidence.push({
        field,
        status: "NOT_FOUND",
        message: `Field '${field}' tidak ditemukan di master-data CSV modul ${modulId}`,
      });
    }
  });
  return evidence;
}
// Fuzzy match: Levenshtein distance sederhana
export function fuzzyMatch(a: string, b: string, threshold = 2): boolean {
  if (a === b) return true;
  // Levenshtein distance
  const matrix = Array(a.length + 1)
    .fill(null)
    .map(() => Array(b.length + 1).fill(null));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }
  return matrix[a.length][b.length] <= threshold;
}

// Detect route in source code (regex sederhana)
export function detectRouteInSource(source: string, route: string): boolean {
  // Contoh: route '/api/data' akan dicari di source
  const regex = new RegExp(route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return regex.test(source);
}

// Tambahan: parser tabel Markdown
export function parseMarkdownTables(
  content: string,
): Array<{ headers: string[]; rows: string[][] }> {
  const tables: Array<{ headers: string[]; rows: string[][]; type?: string }> =
    [];
  const lines = content.split("\n");
  let i = 0;
  while (i < lines.length) {
    // Cari header tabel (baris dengan | dan tanpa ---)
    if (
      lines[i].trim().startsWith("|") &&
      lines[i + 1] &&
      lines[i + 1].includes("---")
    ) {
      // Parsing header
      const headers = lines[i]
        .split("|")
        .map((h) => h.trim())
        .filter((h) => h);
      i += 2; // skip header dan separator
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const row = lines[i]
          .split("|")
          .map((r) => r.trim())
          .filter((r) => r);
        while (row.length < headers.length) row.push("");
        if (row.length === headers.length) rows.push(row);
        i++;
      }
      // Filter type tabel
      let type = "other";
      const headerStr = headers.join(",").toLowerCase();
      if (headerStr.includes("entitas") && headerStr.includes("field"))
        type = "entitas";
      else if (headerStr.includes("role") && headerStr.includes("modul"))
        type = "role-mapping";
      else if (headerStr.includes("status") && headerStr.includes("workflow"))
        type = "workflow";
      else if (headerStr.includes("mapping")) type = "mapping";
      tables.push({ headers, rows, type });
    } else {
      i++;
    }
  }
  return tables;
}

// scripts/matcher.ts
export function extractRequirementsFromMarkdownContent(content: string): any[] {
  const requirements: any[] = [];
  // Heading parser: ##, ###, dst
  const headingRegex = /^\s*(#{1,6})\s+(.+)$/gm;
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    requirements.push({
      type: "heading",
      level: match[1].length,
      text: match[2].trim(),
    });
  }
  // Bullet & sub-bullet: -, *, +
  const bulletRegex = /^\s*([-*+])\s+(.+)$/gm;
  while ((match = bulletRegex.exec(content)) !== null) {
    requirements.push({
      type: "bullet",
      text: match[2].trim(),
    });
  }
  // Numbered list: 1. 2. 3.
  const numberedRegex = /^\s*\d+\.\s+(.+)$/gm;
  while ((match = numberedRegex.exec(content)) !== null) {
    requirements.push({ type: "numbered", text: match[1].trim() });
  }
  // Checklist: - [ ] atau - [x]
  const checklistRegex = /^\s*[-*+]\s+\[( |x|X)\]\s+(.+)$/gm;
  while ((match = checklistRegex.exec(content)) !== null) {
    requirements.push({
      type: "checklist",
      checked: match[1].toLowerCase() === "x",
      text: match[2].trim(),
    });
  }
  // Tabel markdown
  const tableRegex = /^\s*\|(.+)\|\s*$/gm;
  while ((match = tableRegex.exec(content)) !== null) {
    requirements.push({ type: "table", text: match[1].trim() });
  }
  return requirements;
}
