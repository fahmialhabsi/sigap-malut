import React from "react";
import { executiveTheme } from "../../ui/dashboards/executiveTheme";

/**
 * Modal formulir eksekutif — mengganti window.prompt untuk aksesibilitas & kejelasan.
 */
export default function ExecutiveFormModal({
  open,
  title,
  subtitle,
  children,
  onClose,
  primaryLabel = "Simpan",
  onPrimary,
  primaryDisabled = false,
  secondaryLabel = "Batal",
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exec-modal-title"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl shadow-black/50">
        <h2
          id="exec-modal-title"
          className="text-lg font-semibold text-white"
        >
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
        ) : null}
        <div className="mt-4 space-y-3">{children}</div>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className={executiveTheme.buttonSecondary}
          >
            {secondaryLabel}
          </button>
          <button
            type="button"
            disabled={primaryDisabled}
            onClick={onPrimary}
            className={executiveTheme.buttonPrimary}
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
