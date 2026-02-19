export default function Section({
  eyebrow,
  title,
  subtitle,
  actions,
  children,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
      {(eyebrow || title || subtitle || actions) && (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            {eyebrow && (
              <p className="text-xs uppercase tracking-[0.3em] text-muted">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="text-3xl font-display text-ink">{title}</h2>
            )}
            {subtitle && (
              <p className="mt-2 max-w-2xl text-sm text-muted">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
