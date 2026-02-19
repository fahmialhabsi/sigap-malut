export default function Button({
  children,
  className = "",
  variant = "ghost",
  ...props
}) {
  const styles = {
    ghost:
      "rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50",
    solid:
      "rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white shadow-soft-sm transition hover:bg-accentDark",
    soft: "rounded-full border border-slate-200 bg-accentSoft px-4 py-2 text-sm font-semibold text-accentDark transition hover:bg-white",
  };

  return (
    <button className={`${styles[variant]} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}
