#!/usr/bin/env node
import fs from "fs/promises";
import path from "path";
import process from "process";

const DEFAULT_MATRIX_PATH = path.join(
  "dokumenSistem",
  "14-Role-Service-Requirements-Matrix.md",
);

const PHASES = [
  {
    key: "PHASE_1",
    name: "Phase 1",
    label: "CRITICAL (Week 1-4)",
    startWeek: 1,
    endWeek: 4,
    focus: "Super Admin, Sekretariat, UPTD + partial bidang routing",
    target:
      "Tutup isu KRITIS prioritas dan stabilkan akses inti lintas role kunci",
    exitCriteria: "Gate 1 lulus",
  },
  {
    key: "PHASE_2",
    name: "Phase 2",
    label: "HIGH (Week 5-8)",
    startWeek: 5,
    endWeek: 8,
    focus: "Bidang Ketersediaan, Bidang Distribusi + penguatan UPTD",
    target: "Kendalikan isu TINGGI pada dashboard, integrasi, dan data scope",
    exitCriteria: "Gate 2 lulus",
  },
  {
    key: "PHASE_3",
    name: "Phase 3",
    label: "MEDIUM (Week 9-16)",
    startWeek: 9,
    endWeek: 16,
    focus: "Bidang Konsumsi, Public Portal, privacy hardening",
    target:
      "Selesaikan data classification, anonymization, dan readiness publik",
    exitCriteria: "Gate 3 lulus",
  },
];

const ROLE_BASELINE = [
  ["Sekretariat", "85%", "Siap operasional inti (Phase 1)"],
  ["UPTD", "80%", "Siap operasional terbatas (Phase 1)"],
  ["Bidang Ketersediaan", "40%", "Target operasional akhir Phase 2"],
  ["Bidang Distribusi", "35%", "Target operasional akhir Phase 2"],
  ["Bidang Konsumsi", "25%", "Target operasional akhir Phase 3"],
  ["Public Portal", "20%", "Target operasional akhir Phase 3"],
];

const AUDIT_SLOTS = [
  {
    slot: "00:00-01:00",
    focus: "Akses, login lintas role, routing, RBAC",
    output: "Bukti login, route pass, dan hasil uji akses terlarang",
  },
  {
    slot: "01:00-02:00",
    focus: "Workflow Draft-Submit-Approve, integritas data, audit log",
    output: "Jejak status workflow, validasi data, dan evidence audit log",
  },
  {
    slot: "02:00-03:00",
    focus: "Validasi endpoint prioritas, klasifikasi temuan, keputusan gate",
    output:
      "Rekap temuan KRITIS/TINGGI/SEDANG dan keputusan Pass/Conditional/Fail",
  },
];

const PHASE_ORDER = ["PHASE_1", "PHASE_2", "PHASE_3"];

const SEVERITY_RANK = {
  KRITIS: 1,
  TINGGI: 2,
  SEDANG: 3,
  UNKNOWN: 4,
};

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }

    args[key] = next;
    i += 1;
  }
  return args;
}

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value), 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

function parseBoolean(value, fallback) {
  if (value === undefined || value === null) {
    return fallback;
  }

  const text = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "y", "on"].includes(text)) {
    return true;
  }
  if (["0", "false", "no", "n", "off"].includes(text)) {
    return false;
  }
  return fallback;
}

function parseIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`Invalid --start-date format: ${value}. Use YYYY-MM-DD.`);
  }
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid --start-date value: ${value}`);
  }
  return date;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function nextMonday(today) {
  const day = today.getDay(); // 0=Sun, 1=Mon
  const offset = day === 1 ? 0 : (8 - day) % 7;
  return addDays(today, offset === 0 ? 7 : offset);
}

function resolvePhase(week) {
  const phase = PHASES.find(
    (item) => week >= item.startWeek && week <= item.endWeek,
  );
  return phase || PHASES[PHASES.length - 1];
}

function padWeek(week) {
  return String(week).padStart(2, "0");
}

function normalizeWhitespace(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeCell(text, maxLen = 96) {
  const normalized = normalizeWhitespace(text).replace(/\|/g, "/");
  if (normalized.length <= maxLen) {
    return normalized;
  }
  return `${normalized.slice(0, maxLen - 3)}...`;
}

function parseMarkdownRow(line) {
  const trimmed = String(line || "").trim();
  if (!trimmed.startsWith("|")) {
    return [];
  }
  return trimmed
    .split("|")
    .slice(1, -1)
    .map((cell) => normalizeWhitespace(cell));
}

function isSeparatorRow(cells) {
  if (!cells.length) {
    return false;
  }
  return cells.every((cell) => /^:?-{2,}:?$/.test(cell));
}

function normalizeSeverity(rawSeverity) {
  const cleaned = normalizeWhitespace(rawSeverity)
    .toUpperCase()
    .replace(/[^A-Z]/g, "");

  if (cleaned.includes("KRITIS")) {
    return "KRITIS";
  }
  if (cleaned.includes("TINGGI")) {
    return "TINGGI";
  }
  if (cleaned.includes("SEDANG")) {
    return "SEDANG";
  }
  return "UNKNOWN";
}

function extractWeekStart(rawTimeline) {
  const timeline = normalizeWhitespace(rawTimeline);
  const match = timeline.match(/Week\s*(\d+)(?:\s*-\s*(\d+))?/i);
  if (!match) {
    return null;
  }
  return Number.parseInt(match[1], 10);
}

function mapIssueToPhase(severity, timeline) {
  const timelineText = normalizeWhitespace(timeline).toLowerCase();

  if (timelineText.includes("phase-3") || timelineText.includes("phase 3")) {
    return "PHASE_3";
  }
  if (timelineText.includes("phase-2") || timelineText.includes("phase 2")) {
    return "PHASE_2";
  }

  const weekStart = extractWeekStart(timelineText);
  if (weekStart !== null) {
    if (weekStart <= 4) {
      return "PHASE_1";
    }
    if (weekStart <= 8) {
      return "PHASE_2";
    }
    return "PHASE_3";
  }

  if (severity === "KRITIS") {
    return "PHASE_1";
  }
  if (severity === "TINGGI") {
    return "PHASE_2";
  }
  return "PHASE_3";
}

function inferModuleHint(issue, solution) {
  const content =
    `${normalizeWhitespace(issue)} ${normalizeWhitespace(solution)}`.toLowerCase();

  if (
    content.includes("openapi") ||
    content.includes("endpoint") ||
    content.includes("api")
  ) {
    return "API/Contract";
  }
  if (
    content.includes("auth") ||
    content.includes("rbac") ||
    content.includes("jwt") ||
    content.includes("role")
  ) {
    return "Auth/RBAC";
  }
  if (
    content.includes("dashboard") ||
    content.includes("layout") ||
    content.includes("ui") ||
    content.includes("route")
  ) {
    return "Dashboard/Routing";
  }
  if (
    content.includes("field") ||
    content.includes("mapping") ||
    content.includes("master-data") ||
    content.includes("data")
  ) {
    return "Data Integrity";
  }
  if (
    content.includes("privacy") ||
    content.includes("anonym") ||
    content.includes("gdpr") ||
    content.includes("classification")
  ) {
    return "Privacy/Compliance";
  }
  return "Core Workflow";
}

function inferOwner(issue, solution) {
  const content =
    `${normalizeWhitespace(issue)} ${normalizeWhitespace(solution)}`.toLowerCase();

  if (
    content.includes("dashboard") ||
    content.includes("layout") ||
    content.includes("ui") ||
    content.includes("route") ||
    content.includes("form") ||
    content.includes("table") ||
    content.includes("map")
  ) {
    return "FE Lead";
  }
  if (
    content.includes("api") ||
    content.includes("backend") ||
    content.includes("controller") ||
    content.includes("middleware") ||
    content.includes("database") ||
    content.includes("query") ||
    content.includes("openapi")
  ) {
    return "BE Lead";
  }
  if (
    content.includes("privacy") ||
    content.includes("compliance") ||
    content.includes("audit") ||
    content.includes("anonym")
  ) {
    return "BE+QA";
  }
  return "Squad Lead";
}

function parseMatrixBacklog(matrixContent) {
  const lines = String(matrixContent || "").split(/\r?\n/);
  const issues = [];
  let currentRole = "Unknown";
  let inIssueTable = false;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const roleMatch = line.match(/^##\s+\d+\.\s+ROLE:\s+(.+)$/);
    if (roleMatch) {
      currentRole = normalizeWhitespace(roleMatch[1]);
      inIssueTable = false;
      continue;
    }

    if (
      line.includes("| No") &&
      line.includes("Issue") &&
      line.includes("Severity")
    ) {
      inIssueTable = true;
      continue;
    }

    if (!inIssueTable) {
      continue;
    }

    if (!line.trim().startsWith("|")) {
      inIssueTable = false;
      continue;
    }

    const cells = parseMarkdownRow(line);
    if (cells.length < 6 || isSeparatorRow(cells)) {
      continue;
    }

    const noCell = cells[0];
    if (!/^\d+$/.test(noCell)) {
      continue;
    }

    const issue = normalizeWhitespace(cells[1]);
    const severity = normalizeSeverity(cells[2]);
    const solution = normalizeWhitespace(cells[4]);
    const timeline = normalizeWhitespace(cells[5]);
    const phaseKey = mapIssueToPhase(severity, timeline);
    const weekStart = extractWeekStart(timeline);

    issues.push({
      id: issues.length + 1,
      role: currentRole,
      issue,
      severity,
      solution,
      timeline,
      phaseKey,
      weekStart: weekStart ?? 99,
      moduleHint: inferModuleHint(issue, solution),
      ownerHint: inferOwner(issue, solution),
    });
  }

  return issues;
}

function sortIssues(list) {
  return [...list].sort((a, b) => {
    const severityDelta =
      (SEVERITY_RANK[a.severity] || SEVERITY_RANK.UNKNOWN) -
      (SEVERITY_RANK[b.severity] || SEVERITY_RANK.UNKNOWN);
    if (severityDelta !== 0) {
      return severityDelta;
    }

    const weekDelta = (a.weekStart || 99) - (b.weekStart || 99);
    if (weekDelta !== 0) {
      return weekDelta;
    }

    return a.issue.localeCompare(b.issue);
  });
}

function buildPhaseBacklogs(allIssues) {
  const filtered = allIssues.filter(
    (item) => item.severity === "KRITIS" || item.severity === "TINGGI",
  );

  const backlogs = {
    PHASE_1: [],
    PHASE_2: [],
    PHASE_3: [],
  };

  for (const issue of filtered) {
    if (!backlogs[issue.phaseKey]) {
      backlogs[issue.phaseKey] = [];
    }
    backlogs[issue.phaseKey].push(issue);
  }

  for (const key of Object.keys(backlogs)) {
    backlogs[key] = sortIssues(backlogs[key]);
  }

  return {
    backlogs,
    filtered,
  };
}

function buildPhaseFallbackPools(filteredBacklog, phaseBacklogs) {
  const allSorted = sortIssues(filteredBacklog);

  const phase3Focused = sortIssues(
    filteredBacklog.filter((item) => {
      const role = item.role.toLowerCase();
      const issueText = `${item.issue} ${item.solution}`.toLowerCase();
      return (
        role.includes("bidang konsumsi") ||
        role.includes("masyarakat") ||
        role.includes("publik") ||
        issueText.includes("privacy") ||
        issueText.includes("anonym") ||
        issueText.includes("public") ||
        issueText.includes("classification")
      );
    }),
  );

  return {
    PHASE_1:
      phaseBacklogs.PHASE_1.length > 0 ? phaseBacklogs.PHASE_1 : allSorted,
    PHASE_2:
      phaseBacklogs.PHASE_2.length > 0 ? phaseBacklogs.PHASE_2 : allSorted,
    PHASE_3:
      phaseBacklogs.PHASE_3.length > 0
        ? phaseBacklogs.PHASE_3
        : phase3Focused.length > 0
          ? phase3Focused
          : phaseBacklogs.PHASE_2.length > 0
            ? phaseBacklogs.PHASE_2
            : allSorted,
  };
}

function selectMondayItems({
  phaseKey,
  weekIndexInPhase,
  itemsPerWeek,
  phaseBacklogs,
  fallbackPools,
}) {
  const phasePool = phaseBacklogs[phaseKey] || [];
  const fallbackPool = fallbackPools[phaseKey] || [];
  const pool = phasePool.length > 0 ? phasePool : fallbackPool;

  if (!pool.length) {
    return Array.from({ length: itemsPerWeek }, () => ({
      priorityItem: "TBD",
      role: "TBD",
      module: "TBD",
      owner: "TBD",
      status: "Not Started",
    }));
  }

  const offset = (weekIndexInPhase * itemsPerWeek) % pool.length;
  const rows = [];

  for (let i = 0; i < itemsPerWeek; i += 1) {
    const issue = pool[(offset + i) % pool.length];
    rows.push({
      priorityItem: `[#${issue.id}] ${issue.issue}`,
      role: issue.role,
      module: issue.moduleHint,
      owner: issue.ownerHint,
      status: "Planned",
    });
  }

  return rows;
}

function buildBacklogMarkdown({ matrixPath, filtered, backlogs }) {
  const phaseSummaryRows = PHASE_ORDER.map((phaseKey) => {
    const phase = PHASES.find((item) => item.key === phaseKey);
    const list = backlogs[phaseKey] || [];
    const kritis = list.filter((item) => item.severity === "KRITIS").length;
    const tinggi = list.filter((item) => item.severity === "TINGGI").length;
    return `| ${phase.name} | ${list.length} | ${kritis} | ${tinggi} |`;
  }).join("\n");

  const detailRows = filtered
    .map(
      (item) =>
        `| ${item.id} | ${sanitizeCell(item.role, 28)} | ${item.severity} | ${sanitizeCell(item.issue, 72)} | ${sanitizeCell(item.timeline, 18)} | ${item.phaseKey} | ${sanitizeCell(item.solution, 72)} |`,
    )
    .join("\n");

  return `# Auto Backlog Extract (KRITIS/TINGGI)

- Source matrix: ${matrixPath}
- Generated at: ${new Date().toISOString()}
- Filter: Severity KRITIS + TINGGI

## Summary by Phase

| Phase | Total | KRITIS | TINGGI |
|---|---|---|---|
${phaseSummaryRows}

## Detailed Backlog

| ID | Role | Severity | Issue | Timeline | Phase Key | Solution |
|---|---|---|---|---|---|---|
${detailRows}
`;
}

function buildWeeklyFile({
  week,
  weekStart,
  weekEnd,
  phase,
  itemsPerWeek,
  auditHours,
  mondayItems,
}) {
  const weekId = padWeek(week);
  const mondayRows = mondayItems
    .slice(0, itemsPerWeek)
    .map((item, idx) => {
      const no = idx + 1;
      return `| ${no} | ${sanitizeCell(item.priorityItem)} | ${sanitizeCell(item.role, 30)} | ${sanitizeCell(item.module, 40)} | ${sanitizeCell(item.owner, 24)} | ${sanitizeCell(item.status, 18)} |`;
    })
    .join("\n");

  const ttwRows = ["Tuesday", "Wednesday", "Thursday"]
    .map(
      (day) =>
        `### ${day}\n\n| No | Task | Type | Owner | Evidence | Status |\n|---|---|---|---|---|---|\n| 1 | TBD | Implement | TBD | PR/Commit | Not Started |\n| 2 | TBD | Test | TBD | Test log | Not Started |\n| 3 | TBD | Review | TBD | Review note | Not Started |`,
    )
    .join("\n\n");

  const slots = AUDIT_SLOTS.slice(0, auditHours)
    .map(
      (slot, idx) =>
        `| ${idx + 1} | ${slot.slot} | ${slot.focus} | ${slot.output} | [ ] |`,
    )
    .join("\n");

  return `# Week ${weekId} Execution Sheet

- Phase: ${phase.name} (${phase.label})
- Week: ${week}
- Date Range: ${formatIsoDate(weekStart)} to ${formatIsoDate(weekEnd)}
- Focus: ${phase.focus}
- Target: ${phase.target}
- Exit Criteria: ${phase.exitCriteria}

## Monday Prioritization (10-15 item)

| No | Priority Item | Role | Module/Endpoint | Owner | Status |
|---|---|---|---|---|---|
${mondayRows}

## Tuesday-Thursday Delivery

${ttwRows}

## Friday 3-Hour Audit Session

| No | Slot | Focus | Output | Done |
|---|---|---|---|---|
${slots}

## Gate Decision

| Decision | Check |
|---|---|
| Pass | [ ] |
| Conditional | [ ] |
| Fail | [ ] |

## Findings Summary

| Severity | Count | Notes |
|---|---|---|
| KRITIS | 0 | |
| TINGGI | 0 | |
| SEDANG | 0 | |

## Follow Up Commitments

| Item | Owner | Due Date | Status |
|---|---|---|---|
| TBD | TBD | TBD | Open |
`;
}

function buildMasterPlan({
  startDate,
  totalWeeks,
  itemsPerWeek,
  outDir,
  auditHours,
  weeks,
  matrixPath,
  phaseBacklogs,
  autofillMonday,
}) {
  const phaseRows = PHASES.map(
    (phase) =>
      `| ${phase.name} | Week ${phase.startWeek}-${phase.endWeek} | ${phase.focus} | ${phase.target} | ${phase.exitCriteria} |`,
  ).join("\n");

  const baselineRows = ROLE_BASELINE.map(
    ([role, compliance, readiness]) =>
      `| ${role} | ${compliance} | ${readiness} |`,
  ).join("\n");

  const weekRows = weeks
    .map(
      (week) =>
        `| ${week.week} | ${week.phase.name} | ${week.startDate} | ${week.endDate} | Monday: 10-${itemsPerWeek} items, Friday: ${auditHours}h audit |`,
    )
    .join("\n");

  const backlogSummaryRows = PHASE_ORDER.map((phaseKey) => {
    const phase = PHASES.find((item) => item.key === phaseKey);
    const list = phaseBacklogs[phaseKey] || [];
    const kritis = list.filter((item) => item.severity === "KRITIS").length;
    const tinggi = list.filter((item) => item.severity === "TINGGI").length;
    return `| ${phase.name} | ${list.length} | ${kritis} | ${tinggi} |`;
  }).join("\n");

  return `# Execution Plan Generator Output

Generated at: ${new Date().toISOString()}  
Output directory: ${outDir}

## Runtime Configuration

- Start date: ${startDate}
- Total weeks: ${totalWeeks}
- Monday priority items per week: ${itemsPerWeek}
- Friday audit duration: ${auditHours} jam
- Monday autofill from matrix: ${autofillMonday ? "enabled" : "disabled"}
- Matrix source path: ${matrixPath}

## Baseline Role Readiness

| Role | Compliance Saat Ini | Target Readiness |
|---|---|---|
${baselineRows}

## Phase Mapping

| Phase | Range | Focus | Target | Exit Criteria |
|---|---|---|---|---|
${phaseRows}

## Auto Backlog Summary (KRITIS/TINGGI)

| Phase | Total Item | KRITIS | TINGGI |
|---|---|---|---|
${backlogSummaryRows}

## Weekly Plan Index

| Week | Phase | Start Date | End Date | Rhythm |
|---|---|---|---|---|
${weekRows}

## Suggested Command

\`node scripts/generate-execution-plan.js --start-date ${startDate} --weeks ${totalWeeks} --items ${itemsPerWeek} --hours ${auditHours}\`
`;
}

function buildReadme({ outDir, totalWeeks }) {
  return `# Execution Plan Artifacts

Folder ini dihasilkan otomatis oleh generator eksekusi.

## Files

- master-plan.md: ringkasan fase, baseline role, dan indeks weekly plan.
- tracker.json: data terstruktur untuk integrasi dashboard/pipeline.
- backlog-auto.md: hasil ekstraksi backlog KRITIS/TINGGI dari matrix.
- backlog-auto.json: versi JSON backlog KRITIS/TINGGI hasil parsing matrix.
- weekly/week-XX.md: lembar kerja mingguan dari Week 01 sampai Week ${padWeek(totalWeeks)}.

## Cara Pakai

1. Isi Monday Prioritization dengan 10-15 item prioritas backlog fase aktif.
2. Gunakan section Tuesday-Thursday untuk tracking implementasi dan test evidence.
3. Jalankan Friday 3-hour audit, lalu putuskan gate Pass/Conditional/Fail.
4. Rekap temuan severity dan tindak lanjut sebelum pindah minggu berikutnya.
5. Jika autofill aktif, item Monday diambil otomatis dari backlog KRITIS/TINGGI matrix.

## Lokasi Saat Ini

${outDir}
`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const totalWeeks = parsePositiveInt(args.weeks, 16);
  const itemsPerWeek = Math.min(
    15,
    Math.max(10, parsePositiveInt(args.items, 12)),
  );
  const auditHours = Math.min(3, Math.max(1, parsePositiveInt(args.hours, 3)));
  const autofillMonday = parseBoolean(args.autofill, true);
  const matrixPath = path.resolve(
    args.matrix ? String(args.matrix) : DEFAULT_MATRIX_PATH,
  );

  const start = args["start-date"]
    ? parseIsoDate(String(args["start-date"]))
    : nextMonday(new Date());

  const outDir = path.resolve(
    args.out ? String(args.out) : path.join("reports", "execution-plan"),
  );
  const weeklyDir = path.join(outDir, "weekly");

  await fs.mkdir(weeklyDir, { recursive: true });

  let allIssues = [];
  let filteredBacklog = [];
  let phaseBacklogs = {
    PHASE_1: [],
    PHASE_2: [],
    PHASE_3: [],
  };

  if (autofillMonday) {
    let matrixContent = "";
    try {
      matrixContent = await fs.readFile(matrixPath, "utf8");
    } catch (error) {
      throw new Error(
        `Failed to read matrix file at ${matrixPath}. Provide --matrix with a valid path.`,
      );
    }

    allIssues = parseMatrixBacklog(matrixContent);
    const backlog = buildPhaseBacklogs(allIssues);
    filteredBacklog = backlog.filtered;
    phaseBacklogs = backlog.backlogs;
  }

  const weeks = [];
  const phaseWeekCounters = {
    PHASE_1: 0,
    PHASE_2: 0,
    PHASE_3: 0,
  };
  const fallbackPools = buildPhaseFallbackPools(filteredBacklog, phaseBacklogs);

  for (let week = 1; week <= totalWeeks; week += 1) {
    const weekStart = addDays(start, (week - 1) * 7);
    const weekEnd = addDays(weekStart, 6);
    const phase = resolvePhase(week);
    const phaseKey = phase.key;
    const weekIndexInPhase = phaseWeekCounters[phaseKey] || 0;
    phaseWeekCounters[phaseKey] = weekIndexInPhase + 1;

    const mondayItems = autofillMonday
      ? selectMondayItems({
          phaseKey,
          weekIndexInPhase,
          itemsPerWeek,
          phaseBacklogs,
          fallbackPools,
        })
      : Array.from({ length: itemsPerWeek }, () => ({
          priorityItem: "TBD",
          role: "TBD",
          module: "TBD",
          owner: "TBD",
          status: "Not Started",
        }));

    const weekData = {
      week,
      phase,
      startDate: formatIsoDate(weekStart),
      endDate: formatIsoDate(weekEnd),
      focus: phase.focus,
      target: phase.target,
      exitCriteria: phase.exitCriteria,
      gateResult: "planned",
      mondaySeedSource: autofillMonday ? "matrix_backlog" : "manual",
      mondaySeedCount: mondayItems.length,
    };
    weeks.push(weekData);

    const weekFile = buildWeeklyFile({
      week,
      weekStart,
      weekEnd,
      phase,
      itemsPerWeek,
      auditHours,
      mondayItems,
    });

    const weekFilePath = path.join(weeklyDir, `week-${padWeek(week)}.md`);
    await fs.writeFile(weekFilePath, weekFile, "utf8");
  }

  const tracker = {
    generatedAt: new Date().toISOString(),
    config: {
      startDate: formatIsoDate(start),
      totalWeeks,
      itemsPerWeek,
      auditHours,
      source: "14-Role-Service-Requirements-Matrix.md",
      matrixPath,
      autofillMonday,
    },
    phases: PHASES,
    backlogSummary: {
      totalExtracted: filteredBacklog.length,
      phase_1: phaseBacklogs.PHASE_1.length,
      phase_2: phaseBacklogs.PHASE_2.length,
      phase_3: phaseBacklogs.PHASE_3.length,
    },
    weeks,
  };

  const masterPlan = buildMasterPlan({
    startDate: formatIsoDate(start),
    totalWeeks,
    itemsPerWeek,
    outDir,
    auditHours,
    weeks,
    matrixPath,
    phaseBacklogs,
    autofillMonday,
  });

  const backlogAutoMarkdown = buildBacklogMarkdown({
    matrixPath,
    filtered: filteredBacklog,
    backlogs: phaseBacklogs,
  });

  const backlogAutoJson = {
    generatedAt: new Date().toISOString(),
    matrixPath,
    filter: "KRITIS_TINGGI",
    summary: {
      total: filteredBacklog.length,
      phase_1: phaseBacklogs.PHASE_1.length,
      phase_2: phaseBacklogs.PHASE_2.length,
      phase_3: phaseBacklogs.PHASE_3.length,
    },
    items: filteredBacklog,
  };

  await Promise.all([
    fs.writeFile(path.join(outDir, "master-plan.md"), masterPlan, "utf8"),
    fs.writeFile(
      path.join(outDir, "tracker.json"),
      JSON.stringify(tracker, null, 2),
      "utf8",
    ),
    fs.writeFile(
      path.join(outDir, "README.md"),
      buildReadme({ outDir, totalWeeks }),
      "utf8",
    ),
    fs.writeFile(
      path.join(outDir, "backlog-auto.md"),
      backlogAutoMarkdown,
      "utf8",
    ),
    fs.writeFile(
      path.join(outDir, "backlog-auto.json"),
      JSON.stringify(backlogAutoJson, null, 2),
      "utf8",
    ),
  ]);

  console.log("Execution plan generated successfully.");
  console.log(`- Output directory: ${outDir}`);
  console.log(`- Weekly sheets: ${totalWeeks}`);
  console.log(`- Friday audit duration: ${auditHours} jam`);
  console.log(`- Suggested start date: ${formatIsoDate(start)}`);
  console.log(
    `- Monday autofill from matrix: ${autofillMonday ? "enabled" : "disabled"}`,
  );
  if (autofillMonday) {
    console.log(`- Matrix file: ${matrixPath}`);
    console.log(
      `- Extracted KRITIS/TINGGI backlog: ${filteredBacklog.length} item`,
    );
  }
}

main().catch((error) => {
  console.error("Failed to generate execution plan:", error.message);
  process.exit(1);
});
