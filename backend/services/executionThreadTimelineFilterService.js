function splitCsv(v) {
  if (v == null || v === "") return null;
  const arr = String(v)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return arr.length ? arr : null;
}

/**
 * Filter timeline untuk query API (level / jenis / marker / hanya koordinasi horizontal).
 */
export function filterExecutionThreadTimeline(timeline, query = {}) {
  const levels = splitCsv(query.level);
  const kinds = splitCsv(query.kind);
  const markers = splitCsv(query.marker);
  const horizontalOnly =
    query.horizontal_only === "1" ||
    query.horizontal_only === "true" ||
    query.koordinasi_horizontal === "1";

  return (timeline || []).filter((ev) => {
    if (horizontalOnly && ev.kind !== "koordinasi_horizontal") return false;
    if (levels?.length && !levels.includes(String(ev.org_level || ""))) return false;
    if (kinds?.length && !kinds.includes(String(ev.kind || ""))) return false;
    if (markers?.length && !markers.includes(String(ev.marker || ""))) return false;
    return true;
  });
}

/**
 * Metadata navigasi: loncat ke node, unit yang tampil di timeline, ringkas koordinasi.
 */
export function buildTimelineNavigationMeta(timeline, options = {}) {
  const t = timeline || [];
  const jump_targets = {
    first_instruksi: t.find((e) => e.kind === "instruksi")?.sort_key ?? null,
    last_event: t.length ? t[t.length - 1].sort_key : null,
    last_task_eskalasi: [...t].reverse().find((e) => e.kind === "task" && e.marker === "eskalasi")
      ?.sort_key ?? null,
    first_koordinasi_horizontal: t.find((e) => e.kind === "koordinasi_horizontal")?.sort_key ?? null,
  };

  const units = new Set();
  for (const ev of t) {
    const p = ev.payload || {};
    if (p.unit_kerja) units.add(String(p.unit_kerja));
    if (Array.isArray(p.assignments)) {
      for (const a of p.assignments) {
        if (a?.assignee_role) units.add(String(a.assignee_role));
      }
    }
    if (p.from_unit) units.add(String(p.from_unit));
    if (p.to_unit) units.add(String(p.to_unit));
  }

  return {
    jump_targets,
    anchor_sort_key: options.anchor_sort_key || null,
    involved_units: [...units],
    open_coordination_count: options.open_coordination_count ?? null,
    timeline_node_count: t.length,
  };
}
