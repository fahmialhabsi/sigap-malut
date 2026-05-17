/**
 * DynamicForm.jsx — Engine form universal SIGAP-MALUT
 *
 * Membaca definisi field dari FIELDS CSV (master-data) dan merender form
 * yang sesuai untuk semua 94 modul. Setiap pekerjaan dilakukan di dalam sistem.
 *
 * Field types yang didukung:
 *   auto_increment, varchar, text, int, decimal, date, datetime, timestamp,
 *   boolean, enum, json, file
 */
import React, { useState } from "react";

// ─── Render satu field berdasarkan tipe ───────────────────────────────────────
function FieldInput({ field, value, onChange, disabled }) {
  const base =
    "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:bg-gray-50 disabled:text-gray-400";

  const handleChange = (e) => onChange(field.field_name, e.target.value);

  // Jangan tampilkan field auto / sistem / PK
  if (["auto_increment", "created_by", "created_at", "updated_at"].includes(field.field_type)) {
    return null;
  }
  if (["id", "created_by", "created_at", "updated_at"].includes(field.field_name)) {
    return null;
  }

  const label = (
    <label className="block text-xs font-semibold text-gray-700 mb-1">
      {field.field_label}
      {field.is_required === "true" && <span className="text-red-500 ml-1">*</span>}
      {field.help_text && field.help_text !== "NULL" && (
        <span className="ml-1 text-gray-400 font-normal">— {field.help_text}</span>
      )}
    </label>
  );

  switch (field.field_type) {
    case "enum": {
      const opts = field.dropdown_options && field.dropdown_options !== "NULL"
        ? String(field.dropdown_options).replace(/^"|"$/g, "").split(",").map((o) => o.trim().replace(/^"|"$/g, ""))
        : [];
      return (
        <div>
          {label}
          <select
            name={field.field_name}
            value={value ?? ""}
            onChange={handleChange}
            disabled={disabled}
            required={field.is_required === "true"}
            className={`${base} bg-white`}
          >
            <option value="">— Pilih —</option>
            {opts.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
      );
    }

    case "boolean":
      return (
        <div>
          {label}
          <div className="flex gap-3">
            {["Ya", "Tidak"].map((opt) => (
              <label key={opt} className="flex items-center gap-1.5 cursor-pointer text-sm">
                <input
                  type="radio"
                  name={field.field_name}
                  value={opt === "Ya" ? "true" : "false"}
                  checked={
                    opt === "Ya" ? value === "true" || value === true
                    : value === "false" || value === false || value == null
                  }
                  onChange={handleChange}
                  disabled={disabled}
                  className="accent-cyan-600"
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      );

    case "text":
      return (
        <div>
          {label}
          <textarea
            name={field.field_name}
            value={value ?? ""}
            onChange={handleChange}
            disabled={disabled}
            required={field.is_required === "true"}
            rows={3}
            className={`${base} resize-none`}
            placeholder={field.help_text !== "NULL" ? field.help_text : ""}
          />
        </div>
      );

    case "date":
      return (
        <div>
          {label}
          <input
            type="date"
            name={field.field_name}
            value={value ?? ""}
            onChange={handleChange}
            disabled={disabled}
            required={field.is_required === "true"}
            className={base}
          />
        </div>
      );

    case "datetime":
    case "timestamp":
      return (
        <div>
          {label}
          <input
            type="datetime-local"
            name={field.field_name}
            value={value ?? ""}
            onChange={handleChange}
            disabled={disabled}
            required={field.is_required === "true"}
            className={base}
          />
        </div>
      );

    case "int":
      return (
        <div>
          {label}
          <input
            type="number"
            step="1"
            name={field.field_name}
            value={value ?? ""}
            onChange={handleChange}
            disabled={disabled}
            required={field.is_required === "true"}
            className={base}
            placeholder={field.help_text !== "NULL" ? field.help_text : ""}
          />
        </div>
      );

    case "decimal":
      return (
        <div>
          {label}
          <input
            type="number"
            step="0.01"
            name={field.field_name}
            value={value ?? ""}
            onChange={handleChange}
            disabled={disabled}
            required={field.is_required === "true"}
            className={base}
            placeholder={field.help_text !== "NULL" ? field.help_text : ""}
          />
        </div>
      );

    case "file":
    case "json":
      return (
        <div>
          {label}
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700">
            Upload file — fitur ini akan menggunakan penyimpanan internal SIGAP-MALUT.
            <input
              type="url"
              name={field.field_name}
              value={value ?? ""}
              onChange={handleChange}
              disabled={disabled}
              className={`${base} mt-1`}
              placeholder="Tautan file internal (akan diisi sistem)"
            />
          </div>
        </div>
      );

    default: // varchar dan lainnya
      return (
        <div>
          {label}
          <input
            type={field.validation === "email" ? "email" : "text"}
            name={field.field_name}
            value={value ?? ""}
            onChange={handleChange}
            disabled={disabled}
            required={field.is_required === "true"}
            maxLength={field.field_length && field.field_length !== "NULL"
              ? Number(field.field_length) : undefined}
            className={base}
            placeholder={field.help_text !== "NULL" ? field.help_text : ""}
          />
        </div>
      );
  }
}

// ─── Komponen utama DynamicForm ───────────────────────────────────────────────
export default function DynamicForm({
  fields = [],            // Array field definitions (dari CSV)
  initialValues = {},     // Nilai awal (untuk mode edit)
  onSubmit,               // async (formData) => void
  submitLabel = "Simpan",
  disabled = false,
  layout = "single",      // "single" | "two-column"
  excludeFields = [],     // nama field yang tidak ditampilkan
  readonlyFields = [],    // nama field yang read-only
}) {
  const [values, setValues] = useState(() => {
    const init = {};
    fields.forEach((f) => {
      init[f.field_name] = initialValues[f.field_name] ??
        (f.default_value !== "NULL" && f.default_value ? f.default_value : "");
    });
    return init;
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  function handleChange(fieldName, val) {
    setValues((prev) => ({ ...prev, [fieldName]: val }));
    setError(null);
    setSuccess(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validasi required
    const missing = fields.filter(
      (f) => f.is_required === "true"
        && !excludeFields.includes(f.field_name)
        && !["auto_increment"].includes(f.field_type)
        && !["id", "created_by", "created_at", "updated_at"].includes(f.field_name)
        && !String(values[f.field_name] ?? "").trim()
    );
    if (missing.length > 0) {
      setError(`Kolom wajib belum diisi: ${missing.map((f) => f.field_label).join(", ")}`);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit?.(values);
      setSuccess("Data berhasil disimpan ke dalam sistem SIGAP-MALUT.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Gagal menyimpan. Coba lagi."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const visibleFields = fields.filter(
    (f) =>
      !excludeFields.includes(f.field_name) &&
      f.field_type !== "auto_increment" &&
      !["id", "created_by", "created_at", "updated_at"].includes(f.field_name)
  );

  const gridClass = layout === "two-column"
    ? "grid grid-cols-1 sm:grid-cols-2 gap-4"
    : "space-y-4";

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className={gridClass}>
        {visibleFields.map((f) => (
          <FieldInput
            key={f.field_name}
            field={f}
            value={values[f.field_name]}
            onChange={handleChange}
            disabled={disabled || readonlyFields.includes(f.field_name)}
          />
        ))}
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-sm text-emerald-700 font-semibold">
          ✓ {success}
        </div>
      )}

      {!disabled && (
        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition"
          >
            {submitting ? "Menyimpan…" : submitLabel}
          </button>
        </div>
      )}
    </form>
  );
}
