export default function Card({
  title,
  value,
  note,
  tone = "bg-slate-100 text-slate-600",
  children,
  className = "",
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-soft-sm ${className}`.trim()}
    >
      {title && <div className="text-sm font-semibold text-muted">{title}</div>}
      {value && (
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-display text-ink">{value}</span>
          {note && (
            <span className={`rounded-full px-2 py-0.5 text-xs ${tone}`}>
              {note}
            </span>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
