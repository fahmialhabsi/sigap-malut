export default function Badge({
  children,
  tone = "bg-slate-100 text-slate-600",
  className = "",
}) {
  return (
    <span
      className={`rounded-full px-2 py-1 text-xs ${tone} ${className}`.trim()}
    >
      {children}
    </span>
  );
}
