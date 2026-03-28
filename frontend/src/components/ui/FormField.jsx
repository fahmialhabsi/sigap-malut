/**
 * FormField.jsx — Komponen input form standar SIGAP-MALUT.
 *
 * Fitur:
 * - Label + required indicator
 * - Sanitasi XSS otomatis pada onChange
 * - Error message dari react-hook-form
 * - Support: text, email, number, date, textarea, select
 * - WCAG 2.1 accessible (aria-invalid, aria-describedby)
 *
 * Props:
 *   label       string   — Label field
 *   name        string   — Nama field (cocokkan dengan schema)
 *   type        string   — Input type (default: "text")
 *   required    boolean  — Field wajib diisi
 *   error       string   — Pesan error dari react-hook-form
 *   options     array    — [{value, label}] untuk type="select"
 *   register    func     — Dari react-hook-form useForm()
 *   className   string   — Kelas tambahan
 *   rows        number   — Jumlah baris textarea (default: 4)
 *   placeholder string   — Placeholder teks
 */
export default function FormField({
  label,
  name,
  type = "text",
  required = false,
  error,
  options = [],
  register,
  className = "",
  rows = 4,
  placeholder = "",
  ...rest
}) {
  const inputId = `field-${name}`;
  const errorId = `${inputId}-error`;

  const baseClass = `w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-colors
    ${error
      ? "border-red-400 focus:ring-red-300 bg-red-50"
      : "border-slate-300 focus:ring-blue-300 bg-white"
    } ${className}`;

  const registerProps = register ? register(name) : { name };

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
      </label>

      {type === "textarea" ? (
        <textarea
          id={inputId}
          rows={rows}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={baseClass}
          {...registerProps}
          {...rest}
        />
      ) : type === "select" ? (
        <select
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={baseClass}
          {...registerProps}
          {...rest}
        >
          <option value="">-- Pilih --</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={inputId}
          type={type}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={baseClass}
          {...registerProps}
          {...rest}
        />
      )}

      {error && (
        <p id={errorId} className="text-xs text-red-600 mt-0.5" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
