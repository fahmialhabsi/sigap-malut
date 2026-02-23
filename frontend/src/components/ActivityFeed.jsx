import React from "react";

export default function ActivityFeed({ items = [] }) {
  return (
    <div className="bg-white dark:bg-background-card rounded-xl shadow p-4 min-h-[120px] transition-colors duration-300">
      <h2 className="font-semibold text-base mb-2 dark:text-text-main">
        Aktivitas Terbaru
      </h2>
      <ul className="flex flex-col gap-2 text-xs text-muted dark:text-text-muted">
        {items.length === 0 ? (
          <li>- Tidak ada aktivitas terbaru -</li>
        ) : (
          items.map((item, idx) => <li key={idx}>• {item}</li>)
        )}
      </ul>
    </div>
  );
}
