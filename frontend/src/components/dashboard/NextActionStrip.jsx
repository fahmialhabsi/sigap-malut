import React from "react";
import { Link } from "react-router-dom";

/**
 * CTA utama (maks. beberapa item) — hanya render item dengan kondisi nyata (count > 0 atau label eksplisit).
 * @param {{ title?: string, items: Array<{ key: string, label: string, to?: string, onClick?: () => void, show?: boolean }> }} props
 */
export default function NextActionStrip({ title = "Aksi utama", items = [] }) {
  const visible = items.filter((i) => i && i.show !== false);
  if (visible.length === 0) return null;

  return (
    <div
      className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-slate-50 px-4 py-3 shadow-sm"
      role="region"
      aria-label={title}
    >
      <div className="text-xs font-semibold uppercase tracking-wide text-blue-800 mb-2">
        {title}
      </div>
      <div className="flex flex-wrap gap-2">
        {visible.map((item) => {
          const cls =
            "inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors";
          if (item.to) {
            return (
              <Link key={item.key} to={item.to} className={cls}>
                {item.label}
              </Link>
            );
          }
          return (
            <button
              key={item.key}
              type="button"
              className={cls}
              onClick={item.onClick}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
