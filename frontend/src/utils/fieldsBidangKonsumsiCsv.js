// frontend/src/utils/fieldsBidangKonsumsiCsv.js

export function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      // handle escaped quotes ""
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }

    if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
      continue;
    }

    cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

export function parseFieldsCsv(csvText) {
  const lines = String(csvText)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const header = parseCsvLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    const row = {};
    header.forEach((h, idx) => {
      row[h] = cols[idx] ?? "";
    });
    rows.push(row);
  }

  return rows;
}

export function splitDropdownOptions(v) {
  if (!v) return [];
  // options in your CSV look like: "A,B,C"
  return String(v)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function toBool(v) {
  return String(v).toLowerCase() === "true";
}

export function normalizeFieldDef(raw) {
  return {
    name: raw.field_name,
    label: raw.field_label || raw.field_name,
    type: (raw.field_type || "varchar").toLowerCase(),
    required: toBool(raw.is_required),
    unique: toBool(raw.is_unique),
    defaultValue:
      raw.default_value === "NULL" || raw.default_value === ""
        ? null
        : raw.default_value,
    dropdownOptions: splitDropdownOptions(raw.dropdown_options),
    helpText: raw.help_text || "",
  };
}

// fields we typically shouldn't ask users to input manually
export function isSystemField(fieldName) {
  return [
    "id",
    "created_at",
    "updated_at",
    "created_by",
    "updated_by",
    "reported_at",
  ].includes(fieldName);
}
