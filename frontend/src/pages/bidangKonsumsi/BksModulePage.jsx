// frontend/src/pages/bidangKonsumsi/BksModulePage.jsx

import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import api from "../../utils/api";
import {
  parseFieldsCsv,
  normalizeFieldDef,
  isSystemField,
} from "../../utils/fieldsBidangKonsumsiCsv";

function modulUiToApiPath(modulUiId) {
  // "BKS-EVL" -> "/bks-evl"
  return `/${String(modulUiId || "").toLowerCase()}`;
}

function inputTypeFor(fieldType) {
  if (fieldType === "date") return "date";
  if (fieldType === "time") return "time";
  if (fieldType === "timestamp") return "datetime-local";
  if (fieldType === "int") return "number";
  if (fieldType === "decimal") return "number";
  return "text";
}

function buildInitialForm(fields, user) {
  const out = {};
  for (const f of fields) {
    if (!f?.name) continue;

    // default values
    if (f.defaultValue !== null && f.defaultValue !== undefined) {
      out[f.name] = f.defaultValue;
    }

    // auto-set patterns
    if (f.name === "unit_kerja")
      out[f.name] = user?.unit_kerja || user?.unit_id || "Bidang Konsumsi";
    if (f.name === "penanggung_jawab" && !out[f.name])
      out[f.name] = "Kepala Bidang Konsumsi";
    if (f.name === "created_by" && user?.id) out[f.name] = user.id;
  }
  return out;
}

function FieldInput({ field, value, onChange }) {
  const baseClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 " +
    "focus:outline-none focus:ring-2 focus:ring-pink-200 " +
    "dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-pink-900/40";

  // boolean
  if (field.type === "boolean") {
    const checked =
      value === true || value === "true" || value === 1 || value === "1";
    return (
      <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
        <input
          type="checkbox"
          className="h-4 w-4"
          checked={checked}
          onChange={(e) => onChange(field.name, e.target.checked)}
        />
        <span>{field.label}</span>
      </label>
    );
  }

  // enum/select
  if (
    field.type === "enum" &&
    Array.isArray(field.dropdownOptions) &&
    field.dropdownOptions.length
  ) {
    return (
      <select
        className={baseClass}
        value={value ?? ""}
        onChange={(e) => onChange(field.name, e.target.value)}
      >
        <option value="">-- pilih --</option>
        {field.dropdownOptions.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }

  // text area
  if (field.type === "text") {
    return (
      <textarea
        className={baseClass}
        rows={3}
        value={value ?? ""}
        onChange={(e) => onChange(field.name, e.target.value)}
      />
    );
  }

  // json (simple textarea for now)
  if (field.type === "json") {
    return (
      <textarea
        className={baseClass}
        rows={3}
        placeholder='Contoh: ["file1.pdf","file2.jpg"]'
        value={value ?? ""}
        onChange={(e) => onChange(field.name, e.target.value)}
      />
    );
  }

  // numeric / date / time / text
  return (
    <input
      className={baseClass}
      type={inputTypeFor(field.type)}
      value={value ?? ""}
      onChange={(e) => onChange(field.name, e.target.value)}
      step={field.type === "decimal" ? "0.01" : undefined}
    />
  );
}

function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60"
          >
            Tutup
          </button>
        </div>
        <div className="max-h-[75vh] overflow-auto px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

export default function BksModulePage() {
  const { modulUiId } = useParams(); // expects /konsumsi/:modulUiId
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [fields, setFields] = React.useState([]);
  const [loadingFields, setLoadingFields] = React.useState(true);

  const [rows, setRows] = React.useState([]);
  const [loadingRows, setLoadingRows] = React.useState(true);

  const [search, setSearch] = React.useState("");

  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null); // row or null
  const [form, setForm] = React.useState({});
  const [saving, setSaving] = React.useState(false);

  const apiPath = modulUiToApiPath(modulUiId);

  React.useEffect(() => {
    if (!modulUiId) return;

    setLoadingFields(true);
    fetch(`/master-data/FIELDS_BIDANG_KONSUMSI/${modulUiId}_fields.csv`)
      .then((r) => {
        if (!r.ok) throw new Error(`FIELDS CSV not found for ${modulUiId}`);
        return r.text();
      })
      .then((txt) => {
        const defs = parseFieldsCsv(txt).map(normalizeFieldDef);
        setFields(defs);
        setForm(buildInitialForm(defs, user));
      })
      .catch((e) => {
        console.error(e);
        setFields([]);
      })
      .finally(() => setLoadingFields(false));
  }, [modulUiId, user]);

  const loadRows = React.useCallback(() => {
    setLoadingRows(true);
    api
      .get(apiPath)
      .then((r) => setRows(r.data?.data || []))
      .catch((e) => {
        console.error(e);
        setRows([]);
      })
      .finally(() => setLoadingRows(false));
  }, [apiPath]);

  React.useEffect(() => {
    loadRows();
  }, [loadRows]);

  function onChange(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function openCreate() {
    setEditing(null);
    setForm(buildInitialForm(fields, user));
    setModalOpen(true);
  }

  function openEdit(row) {
    setEditing(row);
    setForm({ ...buildInitialForm(fields, user), ...(row || {}) });
    setModalOpen(true);
  }

  async function onSave() {
    setSaving(true);
    try {
      const payload = { ...form };

      // 1) remove system fields from payload
      for (const f of fields) {
        if (f?.name && isSystemField(f.name)) {
          delete payload[f.name];
        }
      }

      // 2) normalize values by field type
      for (const f of fields) {
        if (!f?.name) continue;

        // skip system fields (already removed, but keep safe)
        if (isSystemField(f.name)) continue;

        // empty string -> null
        if (payload[f.name] === "") payload[f.name] = null;

        // json string -> try parse
        if (f.type === "json" && typeof payload[f.name] === "string") {
          const v = payload[f.name].trim();
          if (v && (v.startsWith("[") || v.startsWith("{"))) {
            try {
              payload[f.name] = JSON.parse(v);
            } catch {
              // keep as string if invalid JSON
            }
          }
        }

        // int/decimal -> number (optional but helps)
        if (
          (f.type === "int" || f.type === "decimal") &&
          payload[f.name] != null
        ) {
          const n = Number(payload[f.name]);
          if (!Number.isNaN(n)) payload[f.name] = n;
        }

        // date/timestamp -> null if invalid
        if (
          (f.type === "date" || f.type === "timestamp") &&
          payload[f.name] != null
        ) {
          const d = new Date(payload[f.name]);
          if (Number.isNaN(d.getTime())) {
            payload[f.name] = null;
          }
        }
      }

      // 3) optionally: delete null timestamps so DB can default them (prevents timestamptz parse issues)
      // reported_at is system field (already removed). If you later allow it, keep this pattern.
      // Example:
      // if (payload.reported_at === null) delete payload.reported_at;

      if (editing?.id) {
        await api.put(`${apiPath}/${editing.id}`, payload);
      } else {
        await api.post(apiPath, payload);
      }

      setModalOpen(false);
      await loadRows();
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || e.message || "Gagal menyimpan data");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(row) {
    if (!row?.id) return;
    const ok = confirm("Hapus data ini?");
    if (!ok) return;

    try {
      await api.delete(`${apiPath}/${row.id}`);
      await loadRows();
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || e.message || "Gagal menghapus data");
    }
  }

  const visibleFields = fields.filter((f) => f?.name && !isSystemField(f.name));
  const tableCols = visibleFields.slice(0, 6); // keep list readable

  const filteredRows = rows.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return JSON.stringify(r).toLowerCase().includes(q);
  });

  return (
    <div className="w-full">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {modulUiId}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-300">
            CRUD dinamis dari file fields CSV
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            className="w-64 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            placeholder="Cari..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            onClick={openCreate}
            className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-700"
            disabled={loadingFields}
          >
            + Tambah
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3 dark:border-slate-800">
          <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Total Data:{" "}
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {filteredRows.length}
            </span>
          </div>
          <button
            onClick={() => navigate("/dashboard/konsumsi")}
            className="text-sm text-slate-600 hover:underline dark:text-slate-300"
          >
            Kembali ke Dashboard
          </button>
        </div>

        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950">
              <tr className="text-left text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="px-5 py-3">ID</th>
                {tableCols.map((c) => (
                  <th key={c.name} className="px-5 py-3">
                    {c.label}
                  </th>
                ))}
                <th className="px-5 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loadingRows ? (
                <tr>
                  <td
                    className="px-5 py-4 text-slate-600 dark:text-slate-300"
                    colSpan={tableCols.length + 2}
                  >
                    Memuat data...
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td
                    className="px-5 py-4 text-slate-600 dark:text-slate-300"
                    colSpan={tableCols.length + 2}
                  >
                    Tidak ada data.
                  </td>
                </tr>
              ) : (
                filteredRows.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t border-slate-100 dark:border-slate-800"
                  >
                    <td className="px-5 py-3 font-medium text-slate-900 dark:text-slate-100">
                      {r.id}
                    </td>
                    {tableCols.map((c) => (
                      <td
                        key={c.name}
                        className="px-5 py-3 text-slate-700 dark:text-slate-200"
                      >
                        {String(r?.[c.name] ?? "")}
                      </td>
                    ))}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(r)}
                          className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800/60"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(r)}
                          className="rounded-md border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50 dark:border-red-900/50 dark:text-red-300 dark:hover:bg-red-900/30"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={modalOpen}
        title={
          editing?.id
            ? `Edit ${modulUiId} #${editing.id}`
            : `Tambah ${modulUiId}`
        }
        onClose={() => setModalOpen(false)}
      >
        {loadingFields ? (
          <div className="text-sm text-slate-600 dark:text-slate-300">
            Memuat definisi field...
          </div>
        ) : fields.length === 0 ? (
          <div className="text-sm text-red-600 dark:text-red-300">
            Field CSV tidak ditemukan / tidak bisa dibaca.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visibleFields.map((f) => (
              <div key={f.name} className="flex flex-col gap-1">
                {f.type !== "boolean" && (
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-200">
                    {f.label}{" "}
                    {f.required ? (
                      <span className="text-red-500">*</span>
                    ) : null}
                  </label>
                )}
                <FieldInput
                  field={f}
                  value={form?.[f.name]}
                  onChange={onChange}
                />
                {f.helpText ? (
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {f.helpText}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
          <button
            onClick={() => setModalOpen(false)}
            className="rounded-lg px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/60"
          >
            Batal
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-700 disabled:opacity-60"
          >
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
