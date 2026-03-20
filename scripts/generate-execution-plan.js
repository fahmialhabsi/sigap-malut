#!/usr/bin/env node
import fs from "fs/promises";
import path from "path";
import process from "process";

const DEFAULT_MATRIX_PATH = path.join(
  "dokumenSistem",
  "14-Role-Service-Requirements-Matrix.md",
);

const REQUIRED_DOKUMENSISTEM_NUMBERED_DOCS = [
  "01-kondisi-dinas-pangan.md",
  "02-dokumentasi-sistem.md",
  "03-dashboard-uiux.md",
  "04-Dokumen Integrasi Sistem & Mapping Modul SIGAP-MALUT.md",
  "05-Dashboard-Template-Standar.md",
  "06-Master-Data-Layanan.md",
  "07-Data-Dictionary.md",
  "08-Workflow-Specification.md",
  "09-Role-Module-Matrix.md",
  "10-ERD-Logical-Model.md",
  "11-KPI-Definition-Sheet.md",
  "12-IT-Governance-SPBE-SPIP-Alignment.md",
  "13-System-Architecture-Document.md",
  "14-Role-Service-Requirements-Matrix.md",
  "15-e-pelara-integration-guide-for-sigap-malut.md",
  "16-Audit-Gap-Resmi-SIGAP-MALUT.md",
  "17-Keamanan-Informasi-Lengkap.md",
  "18-Deployment-Production-Guide.md",
  "19-Operations-Runbook.md",
  "20-Testing-Strategy.md",
  "21-Compliance-Matrix-SPBE-SPIP.md",
];

const REQUIRED_DOKUMENSISTEM_SUPPORT_FILES = [
  "README.md",
  "README-backend.md",
  "README-workflows-api.md",
  "openapi.yaml",
  "Struktur Modul.md",
  "Khusus_Integrasi_Data.md",
  "Dokumen_Pencapaian.md",
  "Dokumen_Persiapan_Coding.md",
  "Panduan_Membuat_Master_Data_CSV.md",
  "GENERATOR_WORKFLOW.md",
];

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

const EXECUTION_STAGES = [
  {
    tag: "PLAN",
    label: "Analisis acceptance criteria",
    status: "Planned",
    weekOffset: -1,
  },
  {
    tag: "BUILD",
    label: "Implementasi perbaikan",
    status: "Planned",
    weekOffset: 0,
  },
  {
    tag: "TEST",
    label: "Uji integrasi dan regresi",
    status: "Planned",
    weekOffset: 1,
  },
  {
    tag: "REVIEW",
    label: "Review hasil dan evidence",
    status: "Planned",
    weekOffset: 2,
  },
];

const PHASE_EXTENSION_TASKS = {
  PHASE_1: [
    {
      priorityItem: "[P1-GATE] Hardening RBAC negative test lintas role",
      role: "Super Admin + QA",
      module: "Auth/RBAC",
      owner: "BE+QA",
      status: "Planned",
    },
    {
      priorityItem: "[P1-GATE] Verifikasi konsistensi route dashboard inti",
      role: "Sekretariat + UPTD",
      module: "Dashboard/Routing",
      owner: "FE Lead",
      status: "Planned",
    },
    {
      priorityItem: "[P1-GATE] Validasi endpoint profil dan role mapping",
      role: "Semua role internal",
      module: "API/Contract",
      owner: "BE Lead",
      status: "Planned",
    },
  ],
  PHASE_2: [
    {
      priorityItem:
        "[P2-GATE] Soak test integrasi data Ketersediaan/Distribusi",
      role: "Bidang Ketersediaan + Distribusi",
      module: "Data Integrity",
      owner: "BE+QA",
      status: "Planned",
    },
    {
      priorityItem: "[P2-GATE] Uji performa dashboard bidang",
      role: "Bidang Ketersediaan + Distribusi",
      module: "Dashboard/Routing",
      owner: "FE Lead",
      status: "Planned",
    },
    {
      priorityItem: "[P2-GATE] Verifikasi kelengkapan OpenAPI internal",
      role: "UPTD + Kepala Dinas",
      module: "API/Contract",
      owner: "BE Lead",
      status: "Planned",
    },
  ],
  PHASE_3: [
    {
      priorityItem: "[P3-GATE] Uji privasi dataset publik batch A",
      role: "Bidang Konsumsi + Publik",
      module: "Privacy/Compliance",
      owner: "BE+QA",
      status: "Planned",
    },
    {
      priorityItem: "[P3-GATE] Uji privasi dataset publik batch B",
      role: "Bidang Konsumsi + Publik",
      module: "Privacy/Compliance",
      owner: "BE+QA",
      status: "Planned",
    },
    {
      priorityItem: "[P3-GATE] Audit kebijakan klasifikasi data publik",
      role: "Super Admin + Publik",
      module: "Privacy/Compliance",
      owner: "Squad Lead",
      status: "Planned",
    },
    {
      priorityItem: "[P3-GATE] Validasi dokumentasi OpenAPI public endpoint",
      role: "Masyarakat / Peneliti / Publik",
      module: "API/Contract",
      owner: "BE Lead",
      status: "Planned",
    },
    {
      priorityItem: "[P3-GATE] Simulasi beban rate limit publik",
      role: "Masyarakat / Peneliti / Publik",
      module: "API/Contract",
      owner: "BE+QA",
      status: "Planned",
    },
    {
      priorityItem: "[P3-GATE] Verifikasi anonymization di pipeline ekspor",
      role: "Bidang Konsumsi + Publik",
      module: "Data Integrity",
      owner: "BE+QA",
      status: "Planned",
    },
    {
      priorityItem: "[P3-GATE] UAT portal publik untuk dataset prioritas",
      role: "Masyarakat / Peneliti / Publik",
      module: "Dashboard/Routing",
      owner: "FE Lead",
      status: "Planned",
    },
    {
      priorityItem: "[P3-GATE] Uji proses feedback/data request end-to-end",
      role: "Masyarakat / Peneliti / Publik",
      module: "Core Workflow",
      owner: "FE Lead",
      status: "Planned",
    },
  ],
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
  if (severity === "KRITIS") {
    return "PHASE_1";
  }
  if (severity === "TINGGI") {
    return "PHASE_2";
  }
  if (severity === "SEDANG") {
    return "PHASE_3";
  }

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

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getPhaseMeta(phaseKey) {
  return PHASES.find((phase) => phase.key === phaseKey) || PHASES[0];
}

function resolveTimelineWeek(timeline) {
  const raw = normalizeWhitespace(timeline);
  const fromWeek = extractWeekStart(raw);
  if (fromWeek !== null) {
    return fromWeek;
  }

  const phaseMatch = raw.match(/phase\s*-?\s*(\d+)/i);
  if (phaseMatch) {
    const phaseNumber = Number.parseInt(phaseMatch[1], 10);
    const phase = PHASES.find((item) => item.name === `Phase ${phaseNumber}`);
    if (phase) {
      return phase.startWeek;
    }
  }

  return null;
}

function mapTimelineToPhaseWeek(phaseKey, timeline) {
  const phase = getPhaseMeta(phaseKey);
  const phaseLength = phase.endWeek - phase.startWeek + 1;
  const timelineWeek = resolveTimelineWeek(timeline);

  if (timelineWeek === null) {
    return phaseLength;
  }

  const relativeWeek = timelineWeek - phase.startWeek + 1;
  return clampNumber(relativeWeek, 1, phaseLength);
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
    (item) =>
      item.severity === "KRITIS" ||
      item.severity === "TINGGI" ||
      item.severity === "SEDANG",
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

  const severitySummary = {
    KRITIS: filtered.filter((item) => item.severity === "KRITIS").length,
    TINGGI: filtered.filter((item) => item.severity === "TINGGI").length,
    SEDANG: filtered.filter((item) => item.severity === "SEDANG").length,
    TOTAL: filtered.length,
  };

  return {
    backlogs,
    filtered,
    severitySummary,
  };
}

function buildPhaseTaskQueue(phaseKey, phaseIssues) {
  const phase = getPhaseMeta(phaseKey);
  const phaseLength = phase.endWeek - phase.startWeek + 1;
  const queue = [];
  const sortedIssues = sortIssues(phaseIssues || []);

  for (const issue of sortedIssues) {
    const targetWeekInPhase = mapTimelineToPhaseWeek(phaseKey, issue.timeline);
    for (
      let stageIndex = 0;
      stageIndex < EXECUTION_STAGES.length;
      stageIndex += 1
    ) {
      const stage = EXECUTION_STAGES[stageIndex];
      const scheduledWeekInPhase = clampNumber(
        targetWeekInPhase + stage.weekOffset,
        1,
        phaseLength,
      );
      queue.push({
        priorityItem: `[#${issue.id}][${stage.tag}] ${stage.label}: ${issue.issue}`,
        role: issue.role,
        module: issue.moduleHint,
        owner: issue.ownerHint,
        status: stage.status,
        scheduledWeekInPhase,
        stageIndex,
        sortWeek: issue.weekStart || 99,
        issueOrder: issue.id,
      });
    }
  }

  const extensionTasks = (PHASE_EXTENSION_TASKS[phaseKey] || []).map(
    (item, idx) => ({
      ...item,
      scheduledWeekInPhase: phaseLength,
      stageIndex: EXECUTION_STAGES.length + idx,
      sortWeek: 99,
      issueOrder: 10000 + idx,
    }),
  );

  return [...queue, ...extensionTasks].sort((a, b) => {
    const weekDelta =
      (a.scheduledWeekInPhase || phaseLength) -
      (b.scheduledWeekInPhase || phaseLength);
    if (weekDelta !== 0) {
      return weekDelta;
    }

    const stageDelta = (a.stageIndex || 0) - (b.stageIndex || 0);
    if (stageDelta !== 0) {
      return stageDelta;
    }

    const sortWeekDelta = (a.sortWeek || 99) - (b.sortWeek || 99);
    if (sortWeekDelta !== 0) {
      return sortWeekDelta;
    }

    const orderDelta = (a.issueOrder || 0) - (b.issueOrder || 0);
    if (orderDelta !== 0) {
      return orderDelta;
    }

    return String(a.priorityItem).localeCompare(String(b.priorityItem));
  });
}

function buildPhaseQueues(phaseBacklogs) {
  return {
    PHASE_1: buildPhaseTaskQueue("PHASE_1", phaseBacklogs.PHASE_1 || []),
    PHASE_2: buildPhaseTaskQueue("PHASE_2", phaseBacklogs.PHASE_2 || []),
    PHASE_3: buildPhaseTaskQueue("PHASE_3", phaseBacklogs.PHASE_3 || []),
  };
}

function buildTbdMondayItems(itemsPerWeek) {
  return Array.from({ length: itemsPerWeek }, () => ({
    priorityItem: "TBD",
    role: "TBD",
    module: "TBD",
    owner: "TBD",
    status: "Not Started",
  }));
}

function selectMondayItems({
  phaseKey,
  weekIndexInPhase,
  itemsPerWeek,
  phaseQueues,
  phaseSelectionState,
}) {
  const queue = phaseQueues[phaseKey] || [];
  if (!queue.length) {
    return buildTbdMondayItems(itemsPerWeek);
  }

  if (!phaseSelectionState[phaseKey]) {
    phaseSelectionState[phaseKey] = {
      used: new Set(),
      wrapCursor: 0,
    };
  }

  const currentWeekInPhase = weekIndexInPhase + 1;
  const state = phaseSelectionState[phaseKey];

  const nowCandidates = [];
  const futureCandidates = [];

  for (let idx = 0; idx < queue.length; idx += 1) {
    if (state.used.has(idx)) {
      continue;
    }

    const scheduledWeek = queue[idx].scheduledWeekInPhase || 1;
    if (scheduledWeek <= currentWeekInPhase) {
      nowCandidates.push(idx);
    } else {
      futureCandidates.push(idx);
    }
  }

  const selectedIndexes = [...nowCandidates, ...futureCandidates].slice(
    0,
    itemsPerWeek,
  );

  for (const idx of selectedIndexes) {
    state.used.add(idx);
  }

  const rows = selectedIndexes.map((idx) => {
    const { scheduledWeekInPhase, stageIndex, sortWeek, issueOrder, ...row } =
      queue[idx];
    return row;
  });

  while (rows.length < itemsPerWeek) {
    const wrapIndex = state.wrapCursor;
    const queueIndex = wrapIndex % queue.length;
    const cycle = Math.floor(wrapIndex / queue.length) + 2;
    const { scheduledWeekInPhase, stageIndex, sortWeek, issueOrder, ...base } =
      queue[queueIndex];
    rows.push({
      ...base,
      priorityItem: `${base.priorityItem} [Iterasi-${cycle}]`,
      status: "Carry Over",
    });
    state.wrapCursor += 1;
  }

  return rows;
}

function buildBacklogMarkdown({
  matrixPath,
  filtered,
  backlogs,
  severitySummary,
}) {
  const phaseSummaryRows = PHASE_ORDER.map((phaseKey) => {
    const phase = PHASES.find((item) => item.key === phaseKey);
    const list = backlogs[phaseKey] || [];
    const kritis = list.filter((item) => item.severity === "KRITIS").length;
    const tinggi = list.filter((item) => item.severity === "TINGGI").length;
    const sedang = list.filter((item) => item.severity === "SEDANG").length;
    return `| ${phase.name} | ${list.length} | ${kritis} | ${tinggi} | ${sedang} |`;
  }).join("\n");

  const detailRows = filtered
    .map(
      (item) =>
        `| ${item.id} | ${sanitizeCell(item.role, 28)} | ${item.severity} | ${sanitizeCell(item.issue, 72)} | ${sanitizeCell(item.timeline, 18)} | ${item.phaseKey} | ${sanitizeCell(item.solution, 72)} |`,
    )
    .join("\n");

  return `# Auto Backlog Extract (KRITIS/TINGGI/SEDANG)

- Source matrix: ${matrixPath}
- Generated at: ${new Date().toISOString()}
- Filter: Semua severity dari tabel issue per role

## Summary by Severity

| Severity | Total |
|---|---|
| KRITIS | ${severitySummary.KRITIS} |
| TINGGI | ${severitySummary.TINGGI} |
| SEDANG | ${severitySummary.SEDANG} |
| TOTAL | ${severitySummary.TOTAL} |

## Summary by Phase

| Phase | Total | KRITIS | TINGGI | SEDANG |
|---|---|---|---|---|
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

  const normalizeDeliveryTaskLabel = (priorityItem) =>
    normalizeWhitespace(priorityItem)
      .replace(/^\[[^\]]+\](?:\[[^\]]+\])?\s*/, "")
      .replace(/\s*\[Iterasi-\d+\]\s*$/, "")
      .trim();

  const getDeliveryEvidence = (type) => {
    if (type === "Implement") {
      return "PR/Commit";
    }
    if (type === "Test") {
      return "Test log";
    }
    return "Review note";
  };

  const buildDeliveryRows = ({ type, startIndex }) => {
    const rows = [];
    for (let i = 0; i < 3; i += 1) {
      const sourceItem =
        mondayItems[(startIndex + i) % Math.max(mondayItems.length, 1)] ||
        buildTbdMondayItems(1)[0];
      const label = normalizeDeliveryTaskLabel(
        sourceItem.priorityItem || "TBD",
      );
      rows.push(
        `| ${i + 1} | ${sanitizeCell(`${type}: ${label}`, 72)} | ${type} | ${sanitizeCell(sourceItem.owner || "TBD", 24)} | ${getDeliveryEvidence(type)} | Planned |`,
      );
    }
    return rows.join("\n");
  };

  const ttwRows = ["Tuesday", "Wednesday", "Thursday"]
    .map((day, idx) => {
      const config = [
        { type: "Implement", startIndex: 0 },
        { type: "Test", startIndex: 3 },
        { type: "Review", startIndex: 6 },
      ][idx];

      return `### ${day}\n\n| No | Task | Type | Owner | Evidence | Status |\n|---|---|---|---|---|---|\n${buildDeliveryRows(config)}`;
    })
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
  severitySummary,
  reconciliation,
  docsValidation,
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
    const sedang = list.filter((item) => item.severity === "SEDANG").length;
    return `| ${phase.name} | ${list.length} | ${kritis} | ${tinggi} | ${sedang} |`;
  }).join("\n");

  const reconciliationStatus = reconciliation
    ? reconciliation.isConsistent
      ? "CONSISTENT"
      : "NOT CONSISTENT"
    : "N/A";

  const reconciliationDeclared = reconciliation
    ? `${reconciliation.declared.total} (K:${reconciliation.declared.kritis}, T:${reconciliation.declared.tinggi}, S:${reconciliation.declared.sedang})`
    : "N/A";

  const reconciliationParsed = reconciliation
    ? `${reconciliation.parsed.total} (K:${reconciliation.parsed.kritis}, T:${reconciliation.parsed.tinggi}, S:${reconciliation.parsed.sedang})`
    : "N/A";

  const docsStatus = docsValidation
    ? docsValidation.isComplete
      ? "COMPLETE"
      : "INCOMPLETE"
    : "N/A";

  const docsMissingCount = docsValidation
    ? docsValidation.summary.missingNumberedTotal +
      docsValidation.summary.missingSupportTotal
    : "N/A";

  const docsQualityIssues = docsValidation
    ? docsValidation.summary.qualityIssueTotal
    : "N/A";

  const docsDepthIssues = docsValidation
    ? docsValidation.summary.depthIssueTotal
    : "N/A";

  const docsMinOpenApiPaths = docsValidation
    ? docsValidation.config.minOpenApiPaths
    : "N/A";

  const docsRoot = docsValidation ? docsValidation.docsRootPath : "N/A";

  return `# Execution Plan Generator Output

Generated at: ${new Date().toISOString()}  
Output directory: ${outDir}

## Runtime Configuration

- Start date: ${startDate}
- Total weeks: ${totalWeeks}
- Monday priority items per week: ${itemsPerWeek}
- Friday audit duration: ${auditHours} jam
- OpenAPI minimum paths threshold: ${docsMinOpenApiPaths}
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

## Auto Backlog Summary (KRITIS/TINGGI/SEDANG)

| Severity | Total |
|---|---|
| KRITIS | ${severitySummary.KRITIS} |
| TINGGI | ${severitySummary.TINGGI} |
| SEDANG | ${severitySummary.SEDANG} |
| TOTAL | ${severitySummary.TOTAL} |

| Phase | Total Item | KRITIS | TINGGI | SEDANG |
|---|---|---|---|---|
${backlogSummaryRows}

## Matrix Reconciliation Snapshot

- Status: ${reconciliationStatus}
- Declared summary (matrix): ${reconciliationDeclared}
- Parsed issue rows (generator): ${reconciliationParsed}

## DokumenSistem Completeness Snapshot

- Status: ${docsStatus}
- Missing required docs: ${docsMissingCount}
- Quality issues: ${docsQualityIssues}
- Depth issues: ${docsDepthIssues}
- Docs root path: ${docsRoot}

## Weekly Plan Index

| Week | Phase | Start Date | End Date | Rhythm |
|---|---|---|---|---|
${weekRows}

## Suggested Command

\`node scripts/generate-execution-plan.js --start-date ${startDate} --weeks ${totalWeeks} --items ${itemsPerWeek} --hours ${auditHours} --min-openapi-paths ${docsMinOpenApiPaths}\`
`;
}

function buildReadme({ outDir, totalWeeks }) {
  return `# Execution Plan Artifacts

Folder ini dihasilkan otomatis oleh generator eksekusi.

## Files

- master-plan.md: ringkasan fase, baseline role, dan indeks weekly plan.
- tracker.json: data terstruktur untuk integrasi dashboard/pipeline.
- backlog-auto.md: hasil ekstraksi backlog KRITIS/TINGGI/SEDANG dari matrix.
- backlog-auto.json: versi JSON backlog semua severity hasil parsing matrix.
- matrix-reconciliation.md: validasi declared vs parsed count pada matrix.
- matrix-reconciliation.json: versi JSON hasil rekonsiliasi matrix.
- dokumenSistem-completeness.md: validasi kelengkapan dokumen wajib di folder dokumenSistem.
- dokumenSistem-completeness.json: versi JSON validasi kelengkapan dokumenSistem.
- weekly/week-XX.md: lembar kerja mingguan dari Week 01 sampai Week ${padWeek(totalWeeks)}.

## Cara Pakai

1. Isi Monday Prioritization dengan 10-15 item prioritas backlog fase aktif.
2. Section Tuesday-Thursday terisi otomatis dari item Monday (Implement, Test, Review) dan bisa disesuaikan manual bila perlu.
3. Jalankan Friday 3-hour audit, lalu putuskan gate Pass/Conditional/Fail.
4. Rekap temuan severity dan tindak lanjut sebelum pindah minggu berikutnya.
5. Jika autofill aktif, item Monday diambil otomatis dari severity fase aktif (Phase 1=KRITIS, Phase 2=TINGGI, Phase 3=SEDANG) lalu diurutkan ketat menggunakan timeline mingguan.

## Lokasi Saat Ini

${outDir}
`;
}

function buildParsedSeverityCounts(issues) {
  const parsed = {
    total: 0,
    kritis: 0,
    tinggi: 0,
    sedang: 0,
  };

  for (const issue of issues || []) {
    parsed.total += 1;
    if (issue.severity === "KRITIS") {
      parsed.kritis += 1;
      continue;
    }
    if (issue.severity === "TINGGI") {
      parsed.tinggi += 1;
      continue;
    }
    if (issue.severity === "SEDANG") {
      parsed.sedang += 1;
    }
  }

  return parsed;
}

function parseDeclaredSeverityCounts(matrixContent) {
  const text = String(matrixContent || "");

  const bulletMatch = text.match(
    /Total backlog perbaikan adalah\s+\*\*(\d+)\s+issue\*\*:\s+\*\*(\d+)\s+KRITIS\*\*,\s+\*\*(\d+)\s+TINGGI\*\*,\s+\*\*(\d+)\s+SEDANG\*\*/i,
  );
  if (bulletMatch) {
    return {
      source: "summary_bullet",
      total: Number.parseInt(bulletMatch[1], 10),
      kritis: Number.parseInt(bulletMatch[2], 10),
      tinggi: Number.parseInt(bulletMatch[3], 10),
      sedang: Number.parseInt(bulletMatch[4], 10),
    };
  }

  const totalRowMatch = text.match(
    /\|\s*\*\*TOTAL\*\*\s*\|\s*\*\*(\d+)\*\*\s*\|\s*\*\*(\d+)\*\*\s*\|\s*\*\*(\d+)\*\*\s*\|\s*\*\*(\d+)\*\*\s*\|/i,
  );
  if (totalRowMatch) {
    return {
      source: "category_total_row",
      total: Number.parseInt(totalRowMatch[4], 10),
      kritis: Number.parseInt(totalRowMatch[1], 10),
      tinggi: Number.parseInt(totalRowMatch[2], 10),
      sedang: Number.parseInt(totalRowMatch[3], 10),
    };
  }

  return {
    source: "not_found",
    total: 0,
    kritis: 0,
    tinggi: 0,
    sedang: 0,
  };
}

function buildRoleSeveritySummary(issues) {
  const groups = new Map();

  for (const issue of issues || []) {
    if (!groups.has(issue.role)) {
      groups.set(issue.role, {
        role: issue.role,
        total: 0,
        kritis: 0,
        tinggi: 0,
        sedang: 0,
      });
    }

    const row = groups.get(issue.role);
    row.total += 1;
    if (issue.severity === "KRITIS") {
      row.kritis += 1;
    }
    if (issue.severity === "TINGGI") {
      row.tinggi += 1;
    }
    if (issue.severity === "SEDANG") {
      row.sedang += 1;
    }
  }

  return [...groups.values()].sort((a, b) => a.role.localeCompare(b.role));
}

function buildReconciliationData({ declared, parsed }) {
  const delta = {
    total: parsed.total - declared.total,
    kritis: parsed.kritis - declared.kritis,
    tinggi: parsed.tinggi - declared.tinggi,
    sedang: parsed.sedang - declared.sedang,
  };

  return {
    declared,
    parsed,
    delta,
    isConsistent:
      delta.total === 0 &&
      delta.kritis === 0 &&
      delta.tinggi === 0 &&
      delta.sedang === 0,
  };
}

function buildReconciliationMarkdown({
  matrixPath,
  reconciliation,
  roleSummary,
}) {
  const roleRows = roleSummary
    .map(
      (row) =>
        `| ${sanitizeCell(row.role, 38)} | ${row.total} | ${row.kritis} | ${row.tinggi} | ${row.sedang} |`,
    )
    .join("\n");

  return `# Matrix Reconciliation Report

- Source matrix: ${matrixPath}
- Generated at: ${new Date().toISOString()}

## Declared vs Parsed

| Metric | Declared | Parsed | Delta |
|---|---|---|---|
| TOTAL | ${reconciliation.declared.total} | ${reconciliation.parsed.total} | ${reconciliation.delta.total} |
| KRITIS | ${reconciliation.declared.kritis} | ${reconciliation.parsed.kritis} | ${reconciliation.delta.kritis} |
| TINGGI | ${reconciliation.declared.tinggi} | ${reconciliation.parsed.tinggi} | ${reconciliation.delta.tinggi} |
| SEDANG | ${reconciliation.declared.sedang} | ${reconciliation.parsed.sedang} | ${reconciliation.delta.sedang} |

## Reconciliation Status

- Status: ${reconciliation.isConsistent ? "CONSISTENT" : "NOT CONSISTENT"}
- Declared source: ${reconciliation.declared.source}

## Parsed Counts by Role

| Role | Total | KRITIS | TINGGI | SEDANG |
|---|---|---|---|---|
${roleRows}
`;
}

function detectHeadingNearTop(markdownContent) {
  const lines = String(markdownContent || "").split(/\r?\n/);
  let startIndex = 0;

  const firstNonEmptyIndex = lines.findIndex((line) => line.trim().length > 0);
  if (firstNonEmptyIndex === -1) {
    return false;
  }

  if (lines[firstNonEmptyIndex].trim() === "---") {
    const maxFrontMatterScan = Math.min(
      lines.length - 1,
      firstNonEmptyIndex + 30,
    );
    let frontMatterEndIndex = -1;
    for (
      let idx = firstNonEmptyIndex + 1;
      idx <= maxFrontMatterScan;
      idx += 1
    ) {
      if (lines[idx].trim() === "---") {
        frontMatterEndIndex = idx;
        break;
      }
    }
    if (frontMatterEndIndex !== -1) {
      startIndex = frontMatterEndIndex + 1;
    } else {
      startIndex = firstNonEmptyIndex + 1;
    }
  } else {
    startIndex = firstNonEmptyIndex;
  }

  const maxScanLines = Math.min(lines.length, startIndex + 40);
  for (let idx = startIndex; idx < maxScanLines; idx += 1) {
    const line = lines[idx].trim();
    if (!line) {
      continue;
    }
    if (line.startsWith("#")) {
      return true;
    }
  }

  return false;
}

function hasAnyHeadingMatching(markdownContent, patterns) {
  const lines = String(markdownContent || "").split(/\r?\n/);
  const headingRegex = /^\s{0,3}#{1,6}\s+(.+?)\s*$/;

  for (const line of lines) {
    const match = line.match(headingRegex);
    if (!match) {
      continue;
    }

    const headingText = normalizeWhitespace(match[1]);
    if (!headingText) {
      continue;
    }

    for (const pattern of patterns) {
      if (pattern.test(headingText)) {
        return true;
      }
    }
  }

  return false;
}

function countOpenApiSurface(openApiContent) {
  const content = String(openApiContent || "");
  const pathMatches = content.match(/^\s{2}\/[^\s:]+:\s*$/gm) || [];
  const operationMatches =
    content.match(
      /^\s{4}(get|post|put|patch|delete|options|head|trace):\s*$/gim,
    ) || [];

  return {
    pathCount: pathMatches.length,
    operationCount: operationMatches.length,
  };
}

function countComplianceControlRows(markdownContent) {
  const content = String(markdownContent || "");
  const matches = content.match(/^\|\s*CMP-\d+/gm) || [];
  return matches.length;
}

async function buildDokumenSistemValidation(docsRootPath, options = {}) {
  const minOpenApiPaths = Math.max(
    1,
    parsePositiveInt(options.minOpenApiPaths, 5),
  );

  const validation = {
    generatedAt: new Date().toISOString(),
    docsRootPath,
    config: {
      minOpenApiPaths,
    },
    required: {
      numbered: [...REQUIRED_DOKUMENSISTEM_NUMBERED_DOCS],
      support: [...REQUIRED_DOKUMENSISTEM_SUPPORT_FILES],
    },
    discoveredFiles: [],
    missing: {
      numbered: [],
      support: [],
    },
    qualityIssues: [],
    depthChecks: {
      openApi: {
        file: "openapi.yaml",
        minPathsRequired: minOpenApiPaths,
        pathCount: 0,
        operationCount: 0,
        status: "NOT_CHECKED",
      },
      complianceMatrix: {
        file: "21-Compliance-Matrix-SPBE-SPIP.md",
        minControlRowsRequired: 8,
        controlRows: 0,
        status: "NOT_CHECKED",
      },
      testingStrategy: {
        file: "20-Testing-Strategy.md",
        hasCoverageKeyword: false,
        hasCiKeyword: false,
        status: "NOT_CHECKED",
      },
      securityIncidentResponse: {
        file: "17-Keamanan-Informasi-Lengkap.md",
        hasSection: false,
        status: "NOT_CHECKED",
      },
      operationsBackupRestore: {
        file: "19-Operations-Runbook.md",
        hasSection: false,
        status: "NOT_CHECKED",
      },
      securityHardeningChecklist: {
        file: "17-Keamanan-Informasi-Lengkap.md",
        hasSection: false,
        status: "NOT_CHECKED",
      },
    },
    summary: {
      discoveredTotal: 0,
      requiredNumberedTotal: REQUIRED_DOKUMENSISTEM_NUMBERED_DOCS.length,
      requiredSupportTotal: REQUIRED_DOKUMENSISTEM_SUPPORT_FILES.length,
      missingNumberedTotal: 0,
      missingSupportTotal: 0,
      qualityIssueTotal: 0,
      depthIssueTotal: 0,
    },
    isComplete: false,
    hasError: false,
    error: null,
  };

  let entries = [];
  try {
    entries = await fs.readdir(docsRootPath, { withFileTypes: true });
  } catch (error) {
    validation.hasError = true;
    validation.error = String(error?.message || error);
    return validation;
  }

  const discoveredFiles = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  validation.discoveredFiles = discoveredFiles;
  validation.summary.discoveredTotal = discoveredFiles.length;

  const discoveredSet = new Set(
    discoveredFiles.map((fileName) => fileName.toLowerCase()),
  );

  validation.missing.numbered = REQUIRED_DOKUMENSISTEM_NUMBERED_DOCS.filter(
    (fileName) => !discoveredSet.has(fileName.toLowerCase()),
  );
  validation.missing.support = REQUIRED_DOKUMENSISTEM_SUPPORT_FILES.filter(
    (fileName) => !discoveredSet.has(fileName.toLowerCase()),
  );

  const markdownFilesToCheck = [
    ...REQUIRED_DOKUMENSISTEM_NUMBERED_DOCS,
    ...REQUIRED_DOKUMENSISTEM_SUPPORT_FILES,
  ].filter((fileName) => fileName.toLowerCase().endsWith(".md"));

  for (const fileName of markdownFilesToCheck) {
    if (!discoveredSet.has(fileName.toLowerCase())) {
      continue;
    }

    const filePath = path.join(docsRootPath, fileName);
    try {
      const content = await fs.readFile(filePath, "utf8");
      const lines = String(content).split(/\r?\n/);

      if (!detectHeadingNearTop(content)) {
        validation.qualityIssues.push({
          file: fileName,
          type: "missing_markdown_heading",
          detail:
            "Heading markdown tidak ditemukan pada bagian awal dokumen (maks. 40 baris awal setelah front matter).",
        });
      }

      if (lines.length < 8) {
        validation.qualityIssues.push({
          file: fileName,
          type: "too_short",
          detail: `Dokumen hanya memiliki ${lines.length} baris (< 8).`,
        });
      }
    } catch (error) {
      validation.qualityIssues.push({
        file: fileName,
        type: "read_error",
        detail: String(error?.message || error),
      });
    }
  }

  const openApiPath = path.join(docsRootPath, "openapi.yaml");
  if (discoveredSet.has("openapi.yaml")) {
    try {
      const openApiContent = await fs.readFile(openApiPath, "utf8");
      const { pathCount, operationCount } = countOpenApiSurface(openApiContent);
      validation.depthChecks.openApi.pathCount = pathCount;
      validation.depthChecks.openApi.operationCount = operationCount;

      if (pathCount < minOpenApiPaths) {
        validation.depthChecks.openApi.status = "FAIL";
        validation.qualityIssues.push({
          file: "openapi.yaml",
          type: "openapi_insufficient_paths",
          detail: `Jumlah path OpenAPI ${pathCount} lebih kecil dari minimal ${minOpenApiPaths}.`,
        });
      } else if (operationCount < pathCount) {
        validation.depthChecks.openApi.status = "FAIL";
        validation.qualityIssues.push({
          file: "openapi.yaml",
          type: "openapi_sparse_operations",
          detail: `Jumlah operasi OpenAPI ${operationCount} lebih kecil dari jumlah path ${pathCount}.`,
        });
      } else {
        validation.depthChecks.openApi.status = "PASS";
      }
    } catch (error) {
      validation.depthChecks.openApi.status = "ERROR";
      validation.qualityIssues.push({
        file: "openapi.yaml",
        type: "openapi_read_error",
        detail: String(error?.message || error),
      });
    }
  } else {
    validation.depthChecks.openApi.status = "FAIL";
  }

  const complianceMatrixPath = path.join(
    docsRootPath,
    "21-Compliance-Matrix-SPBE-SPIP.md",
  );
  if (discoveredSet.has("21-compliance-matrix-spbe-spip.md")) {
    try {
      const complianceContent = await fs.readFile(complianceMatrixPath, "utf8");
      const controlRows = countComplianceControlRows(complianceContent);
      validation.depthChecks.complianceMatrix.controlRows = controlRows;

      if (
        controlRows <
        validation.depthChecks.complianceMatrix.minControlRowsRequired
      ) {
        validation.depthChecks.complianceMatrix.status = "FAIL";
        validation.qualityIssues.push({
          file: "21-Compliance-Matrix-SPBE-SPIP.md",
          type: "compliance_matrix_shallow",
          detail: `Row kontrol CMP hanya ${controlRows}, minimal ${validation.depthChecks.complianceMatrix.minControlRowsRequired}.`,
        });
      } else {
        validation.depthChecks.complianceMatrix.status = "PASS";
      }
    } catch (error) {
      validation.depthChecks.complianceMatrix.status = "ERROR";
      validation.qualityIssues.push({
        file: "21-Compliance-Matrix-SPBE-SPIP.md",
        type: "compliance_matrix_read_error",
        detail: String(error?.message || error),
      });
    }
  } else {
    validation.depthChecks.complianceMatrix.status = "FAIL";
  }

  const testingStrategyPath = path.join(docsRootPath, "20-Testing-Strategy.md");
  if (discoveredSet.has("20-testing-strategy.md")) {
    try {
      const testingContent = await fs.readFile(testingStrategyPath, "utf8");
      const lowered = testingContent.toLowerCase();
      const hasCoverageKeyword = lowered.includes("coverage");
      const hasCiKeyword =
        lowered.includes("ci ") ||
        lowered.includes("ci/") ||
        lowered.includes("ci gate") ||
        lowered.includes("ci gate");

      validation.depthChecks.testingStrategy.hasCoverageKeyword =
        hasCoverageKeyword;
      validation.depthChecks.testingStrategy.hasCiKeyword = hasCiKeyword;

      if (!hasCoverageKeyword || !hasCiKeyword) {
        validation.depthChecks.testingStrategy.status = "FAIL";
        validation.qualityIssues.push({
          file: "20-Testing-Strategy.md",
          type: "testing_strategy_shallow",
          detail:
            "Dokumen testing strategy harus memuat kata kunci coverage dan CI/quality gate.",
        });
      } else {
        validation.depthChecks.testingStrategy.status = "PASS";
      }
    } catch (error) {
      validation.depthChecks.testingStrategy.status = "ERROR";
      validation.qualityIssues.push({
        file: "20-Testing-Strategy.md",
        type: "testing_strategy_read_error",
        detail: String(error?.message || error),
      });
    }
  } else {
    validation.depthChecks.testingStrategy.status = "FAIL";
  }

  const securityDocPath = path.join(
    docsRootPath,
    "17-Keamanan-Informasi-Lengkap.md",
  );
  if (discoveredSet.has("17-keamanan-informasi-lengkap.md")) {
    try {
      const securityContent = await fs.readFile(securityDocPath, "utf8");

      const hasIncidentResponseSection = hasAnyHeadingMatching(
        securityContent,
        [
          /incident\s*response/i,
          /respon(?:s)?\s+insiden/i,
          /manajemen\s+insiden/i,
        ],
      );
      validation.depthChecks.securityIncidentResponse.hasSection =
        hasIncidentResponseSection;

      if (!hasIncidentResponseSection) {
        validation.depthChecks.securityIncidentResponse.status = "FAIL";
        validation.qualityIssues.push({
          file: "17-Keamanan-Informasi-Lengkap.md",
          type: "security_incident_response_missing_section",
          detail:
            "Dokumen keamanan wajib memiliki section heading Incident Response/Respon Insiden.",
        });
      } else {
        validation.depthChecks.securityIncidentResponse.status = "PASS";
      }

      const hasHardeningChecklistSection = hasAnyHeadingMatching(
        securityContent,
        [
          /(hardening|keamanan|security).*(checklist)/i,
          /(checklist).*(hardening|keamanan|security)/i,
          /checklist\s+kepatuhan\s+keamanan/i,
        ],
      );
      validation.depthChecks.securityHardeningChecklist.hasSection =
        hasHardeningChecklistSection;

      if (!hasHardeningChecklistSection) {
        validation.depthChecks.securityHardeningChecklist.status = "FAIL";
        validation.qualityIssues.push({
          file: "17-Keamanan-Informasi-Lengkap.md",
          type: "security_hardening_checklist_missing_section",
          detail:
            "Dokumen keamanan wajib memiliki section heading hardening/security checklist.",
        });
      } else {
        validation.depthChecks.securityHardeningChecklist.status = "PASS";
      }
    } catch (error) {
      const readError = String(error?.message || error);
      validation.depthChecks.securityIncidentResponse.status = "ERROR";
      validation.depthChecks.securityHardeningChecklist.status = "ERROR";
      validation.qualityIssues.push({
        file: "17-Keamanan-Informasi-Lengkap.md",
        type: "security_depth_check_read_error",
        detail: readError,
      });
    }
  } else {
    validation.depthChecks.securityIncidentResponse.status = "FAIL";
    validation.depthChecks.securityHardeningChecklist.status = "FAIL";
  }

  const operationsDocPath = path.join(docsRootPath, "19-Operations-Runbook.md");
  if (discoveredSet.has("19-operations-runbook.md")) {
    try {
      const operationsContent = await fs.readFile(operationsDocPath, "utf8");
      const hasBackupRestoreSection = hasAnyHeadingMatching(operationsContent, [
        /backup.*(restore|recovery)/i,
        /(restore|recovery).*(backup)/i,
      ]);
      validation.depthChecks.operationsBackupRestore.hasSection =
        hasBackupRestoreSection;

      if (!hasBackupRestoreSection) {
        validation.depthChecks.operationsBackupRestore.status = "FAIL";
        validation.qualityIssues.push({
          file: "19-Operations-Runbook.md",
          type: "operations_backup_restore_missing_section",
          detail:
            "Dokumen operations runbook wajib memiliki section heading backup-restore/recovery.",
        });
      } else {
        validation.depthChecks.operationsBackupRestore.status = "PASS";
      }
    } catch (error) {
      validation.depthChecks.operationsBackupRestore.status = "ERROR";
      validation.qualityIssues.push({
        file: "19-Operations-Runbook.md",
        type: "operations_depth_check_read_error",
        detail: String(error?.message || error),
      });
    }
  } else {
    validation.depthChecks.operationsBackupRestore.status = "FAIL";
  }

  validation.summary.missingNumberedTotal = validation.missing.numbered.length;
  validation.summary.missingSupportTotal = validation.missing.support.length;
  validation.summary.depthIssueTotal = [
    validation.depthChecks.openApi.status,
    validation.depthChecks.complianceMatrix.status,
    validation.depthChecks.testingStrategy.status,
    validation.depthChecks.securityIncidentResponse.status,
    validation.depthChecks.operationsBackupRestore.status,
    validation.depthChecks.securityHardeningChecklist.status,
  ].filter((status) => status === "FAIL" || status === "ERROR").length;
  validation.summary.qualityIssueTotal = validation.qualityIssues.length;

  validation.isComplete =
    !validation.hasError &&
    validation.missing.numbered.length === 0 &&
    validation.missing.support.length === 0 &&
    validation.qualityIssues.length === 0;

  return validation;
}

function buildDokumenSistemValidationMarkdown(validation) {
  const discoveredSet = new Set(
    (validation.discoveredFiles || []).map((fileName) =>
      fileName.toLowerCase(),
    ),
  );

  const numberedRows = REQUIRED_DOKUMENSISTEM_NUMBERED_DOCS.map((fileName) => {
    const exists = discoveredSet.has(fileName.toLowerCase());
    return `| ${fileName} | ${exists ? "FOUND" : "MISSING"} | ${exists ? "OK" : "Tambahkan dokumen ini."} |`;
  }).join("\n");

  const supportRows = REQUIRED_DOKUMENSISTEM_SUPPORT_FILES.map((fileName) => {
    const exists = discoveredSet.has(fileName.toLowerCase());
    return `| ${fileName} | ${exists ? "FOUND" : "MISSING"} | ${exists ? "OK" : "Tambahkan dokumen pendukung ini."} |`;
  }).join("\n");

  const qualityRows =
    validation.qualityIssues.length > 0
      ? validation.qualityIssues
          .map(
            (item, index) =>
              `| ${index + 1} | ${item.file} | ${item.type} | ${sanitizeCell(item.detail, 80)} |`,
          )
          .join("\n")
      : "| 1 | - | - | Tidak ada quality issue pada dokumen wajib. |";

  return `# DokumenSistem Completeness Report

- Generated at: ${validation.generatedAt}
- Docs root: ${validation.docsRootPath}
- Status: ${validation.isComplete ? "COMPLETE" : "INCOMPLETE"}
- Discovered files: ${validation.summary.discoveredTotal}
- Missing numbered docs: ${validation.summary.missingNumberedTotal}
- Missing support files: ${validation.summary.missingSupportTotal}
- Quality issues: ${validation.summary.qualityIssueTotal}
- Depth issues: ${validation.summary.depthIssueTotal}

${validation.hasError ? `- Error: ${validation.error}` : ""}

## Numbered Documents (01-21)

| File | Status | Note |
|---|---|---|
${numberedRows}

## Support Documents

| File | Status | Note |
|---|---|---|
${supportRows}

## Quality Issues

| No | File | Type | Detail |
|---|---|---|---|
${qualityRows}

## Depth Checks

| Check | Status | Detail |
|---|---|---|
| OpenAPI minimum paths | ${validation.depthChecks.openApi.status} | paths=${validation.depthChecks.openApi.pathCount}, operations=${validation.depthChecks.openApi.operationCount}, minPaths=${validation.depthChecks.openApi.minPathsRequired} |
| Compliance matrix control rows | ${validation.depthChecks.complianceMatrix.status} | controlRows=${validation.depthChecks.complianceMatrix.controlRows}, minRows=${validation.depthChecks.complianceMatrix.minControlRowsRequired} |
| Testing strategy keywords | ${validation.depthChecks.testingStrategy.status} | coverage=${validation.depthChecks.testingStrategy.hasCoverageKeyword}, ci=${validation.depthChecks.testingStrategy.hasCiKeyword} |
| Security incident response section | ${validation.depthChecks.securityIncidentResponse.status} | file=${validation.depthChecks.securityIncidentResponse.file}, present=${validation.depthChecks.securityIncidentResponse.hasSection} |
| Operations backup-restore section | ${validation.depthChecks.operationsBackupRestore.status} | file=${validation.depthChecks.operationsBackupRestore.file}, present=${validation.depthChecks.operationsBackupRestore.hasSection} |
| Security hardening checklist section | ${validation.depthChecks.securityHardeningChecklist.status} | file=${validation.depthChecks.securityHardeningChecklist.file}, present=${validation.depthChecks.securityHardeningChecklist.hasSection} |
`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const totalWeeks = parsePositiveInt(args.weeks, 16);
  const itemsArg = args.items ?? args["monday-items"];
  const hoursArg = args.hours ?? args["audit-hours"];
  const minOpenApiPaths = Math.max(
    1,
    parsePositiveInt(args["min-openapi-paths"], 5),
  );
  const itemsPerWeek = Math.min(
    15,
    Math.max(10, parsePositiveInt(itemsArg, 12)),
  );
  const auditHours = Math.min(3, Math.max(1, parsePositiveInt(hoursArg, 3)));
  const autofillMonday = parseBoolean(args.autofill, true);
  const matrixPath = path.resolve(
    args.matrix ? String(args.matrix) : DEFAULT_MATRIX_PATH,
  );
  const docsRootPath = path.resolve(
    args["docs-root"]
      ? String(args["docs-root"])
      : args.docs
        ? String(args.docs)
        : path.dirname(matrixPath),
  );

  const start = args["start-date"]
    ? parseIsoDate(String(args["start-date"]))
    : nextMonday(new Date());

  const outDir = path.resolve(
    args.out ? String(args.out) : path.join("reports", "execution-plan"),
  );
  const weeklyDir = path.join(outDir, "weekly");

  await fs.mkdir(weeklyDir, { recursive: true });

  const docsValidation = await buildDokumenSistemValidation(docsRootPath, {
    minOpenApiPaths,
  });
  const docsValidationMarkdown =
    buildDokumenSistemValidationMarkdown(docsValidation);

  let matrixContent = "";
  let allIssues = [];
  let filteredBacklog = [];
  let severitySummary = {
    KRITIS: 0,
    TINGGI: 0,
    SEDANG: 0,
    TOTAL: 0,
  };
  let parsedSeverity = {
    total: 0,
    kritis: 0,
    tinggi: 0,
    sedang: 0,
  };
  let reconciliation = null;
  let roleSeveritySummary = [];
  let phaseBacklogs = {
    PHASE_1: [],
    PHASE_2: [],
    PHASE_3: [],
  };

  if (autofillMonday) {
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
    severitySummary = backlog.severitySummary;
    parsedSeverity = buildParsedSeverityCounts(filteredBacklog);
    phaseBacklogs = backlog.backlogs;

    const declaredCounts = parseDeclaredSeverityCounts(matrixContent);
    reconciliation = buildReconciliationData({
      declared: declaredCounts,
      parsed: parsedSeverity,
    });
    roleSeveritySummary = buildRoleSeveritySummary(filteredBacklog);
  }

  const weeks = [];
  const phaseWeekCounters = {
    PHASE_1: 0,
    PHASE_2: 0,
    PHASE_3: 0,
  };
  const phaseSelectionState = {};
  const phaseQueues = buildPhaseQueues(phaseBacklogs);

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
          phaseQueues,
          phaseSelectionState,
        })
      : buildTbdMondayItems(itemsPerWeek);

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
      minOpenApiPaths,
      source: "14-Role-Service-Requirements-Matrix.md",
      matrixPath,
      autofillMonday,
    },
    phases: PHASES,
    backlogSummary: {
      totalExtracted: filteredBacklog.length,
      severity: parsedSeverity,
      byPhase: {
        phase_1: phaseBacklogs.PHASE_1.length,
        phase_2: phaseBacklogs.PHASE_2.length,
        phase_3: phaseBacklogs.PHASE_3.length,
      },
    },
    matrixValidation: reconciliation,
    documentationValidation: docsValidation,
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
    severitySummary,
    reconciliation,
    docsValidation,
    autofillMonday,
  });

  const backlogAutoMarkdown = buildBacklogMarkdown({
    matrixPath,
    filtered: filteredBacklog,
    backlogs: phaseBacklogs,
    severitySummary,
  });

  const reconciliationData =
    reconciliation ||
    buildReconciliationData({
      declared: {
        source: "not_checked",
        total: 0,
        kritis: 0,
        tinggi: 0,
        sedang: 0,
      },
      parsed: parsedSeverity,
    });

  const reconciliationMarkdown = buildReconciliationMarkdown({
    matrixPath,
    reconciliation: reconciliationData,
    roleSummary: roleSeveritySummary,
  });

  const backlogAutoJson = {
    generatedAt: new Date().toISOString(),
    matrixPath,
    filter: "ALL_SEVERITY",
    summary: {
      total: filteredBacklog.length,
      severity: parsedSeverity,
      byPhase: {
        phase_1: phaseBacklogs.PHASE_1.length,
        phase_2: phaseBacklogs.PHASE_2.length,
        phase_3: phaseBacklogs.PHASE_3.length,
      },
    },
    items: filteredBacklog,
  };

  const reconciliationJson = {
    generatedAt: new Date().toISOString(),
    matrixPath,
    ...reconciliationData,
    roleSummary: roleSeveritySummary,
  };

  const docsValidationJson = {
    generatedAt: new Date().toISOString(),
    ...docsValidation,
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
    fs.writeFile(
      path.join(outDir, "matrix-reconciliation.md"),
      reconciliationMarkdown,
      "utf8",
    ),
    fs.writeFile(
      path.join(outDir, "matrix-reconciliation.json"),
      JSON.stringify(reconciliationJson, null, 2),
      "utf8",
    ),
    fs.writeFile(
      path.join(outDir, "dokumenSistem-completeness.md"),
      docsValidationMarkdown,
      "utf8",
    ),
    fs.writeFile(
      path.join(outDir, "dokumenSistem-completeness.json"),
      JSON.stringify(docsValidationJson, null, 2),
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
  console.log(
    `- DokumenSistem validation: ${docsValidation.isComplete ? "COMPLETE" : "INCOMPLETE"}`,
  );
  console.log(
    `- Missing required docs: ${docsValidation.summary.missingNumberedTotal + docsValidation.summary.missingSupportTotal}`,
  );
  console.log(
    `- Dokumen quality issues: ${docsValidation.summary.qualityIssueTotal}`,
  );
  console.log(
    `- Dokumen depth issues: ${docsValidation.summary.depthIssueTotal}`,
  );
  console.log(
    `- OpenAPI paths detected: ${docsValidation.depthChecks.openApi.pathCount} (min=${docsValidation.depthChecks.openApi.minPathsRequired})`,
  );
  if (autofillMonday) {
    console.log(`- Matrix file: ${matrixPath}`);
    console.log(
      `- Extracted issue rows: ${filteredBacklog.length} item (KRITIS=${parsedSeverity.kritis}, TINGGI=${parsedSeverity.tinggi}, SEDANG=${parsedSeverity.sedang})`,
    );
    if (reconciliation && !reconciliation.isConsistent) {
      console.log(
        `- Matrix summary mismatch: declared=${reconciliation.declared.total} parsed=${reconciliation.parsed.total}`,
      );
    }
  }
}

main().catch((error) => {
  console.error("Failed to generate execution plan:", error.message);
  process.exit(1);
});
