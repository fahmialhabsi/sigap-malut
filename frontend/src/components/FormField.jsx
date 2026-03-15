import React from "react";

// Komponen FormField universal untuk input text, number, select, textarea, file
export default function FormField({ field, value, onChange, className = "" }) {
  if (field.field_type === "enum" && field.dropdown_options) {
    const options = field.dropdown_options.split(",");
    return (
      <select
        name={field.field_name}
        value={value}
        onChange={onChange}
        className={`border rounded px-2 py-1 w-full bg-slate-900 text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-400 ${className}`}
      >
        <option value="" className="bg-slate-900 text-slate-400">
          Pilih...
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-slate-900 text-slate-100">
            {opt}
          </option>
        ))}
      </select>
    );
  }
  if (field.field_type === "text") {
    return (
      <textarea
        name={field.field_name}
        value={value}
        onChange={onChange}
        className={`border rounded px-2 py-1 w-full bg-slate-900 text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-400 ${className}`}
        rows={3}
      />
    );
  }
  if (field.field_type === "file") {
    return (
      <input
        type="file"
        name={field.field_name}
        onChange={onChange}
        className={`border rounded px-2 py-1 w-full bg-slate-900 text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-400 ${className}`}
      />
    );
  }
  return (
    <input
      type={
        field.field_type === "int" || field.field_type === "decimal"
          ? "number"
          : field.field_type === "date"
            ? "date"
            : "text"
      }
      name={field.field_name}
      value={value}
      onChange={onChange}
      className={`border rounded px-2 py-1 w-full bg-slate-900 text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-400 ${className}`}
    />
  );
}
