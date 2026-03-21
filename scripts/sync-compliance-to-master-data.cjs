// sync-compliance-to-master-data.cjs
// Script untuk sinkronisasi evidence compliance ke master-data CSV

const fs = require("fs");
const path = require("path");
const csvWriter = require("csv-writer").createObjectCsvWriter;

const REPORT_PATH = path.resolve(__dirname, "../reports/report.json");
const MASTER_PATH = path.resolve(
  __dirname,
  "../master-data/00_COMPLIANCE_AUDIT_TRAIL.csv",
);

function flattenEvidence(result) {
  return (result.evidence || []).map((ev) => ({
    requirement_id: result.requirement.id,
    modul_id: result.requirement.docFile,
    section: result.requirement.section,
    type: result.requirement.type,
    name: result.requirement.name,
    status: result.status,
    file: ev.file,
    line: ev.line,
    snippet: ev.snippet,
    confidence: ev.confidence,
    recommendation: result.recommendation,
    severity: result.severity,
    time: new Date().toISOString(),
  }));
}

function main() {
  const report = JSON.parse(fs.readFileSync(REPORT_PATH, "utf-8"));
  const allEvidence = report.results.flatMap(flattenEvidence);

  const writer = csvWriter({
    path: MASTER_PATH,
    header: [
      { id: "requirement_id", title: "requirement_id" },
      { id: "modul_id", title: "modul_id" },
      { id: "section", title: "section" },
      { id: "type", title: "type" },
      { id: "name", title: "name" },
      { id: "status", title: "status" },
      { id: "file", title: "file" },
      { id: "line", title: "line" },
      { id: "snippet", title: "snippet" },
      { id: "confidence", title: "confidence" },
      { id: "recommendation", title: "recommendation" },
      { id: "severity", title: "severity" },
      { id: "time", title: "time" },
    ],
  });

  writer.writeRecords(allEvidence).then(() => {
    console.log("Compliance evidence synced to master-data CSV.");
  });
}

main();
