import React from "react";

export default function DashboardHeader({ title, subtitle, filters, actions }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-2xl font-display text-primary font-bold">
          {title}
        </h2>
        {subtitle && <p className="text-sm text-muted mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {filters && <div className="flex gap-2">{filters}</div>}
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
    </div>
  );
}
