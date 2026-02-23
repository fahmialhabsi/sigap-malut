import React from "react";

export default function AIInbox({ items = [] }) {
  return (
    <div className="bg-white dark:bg-background-card rounded-xl shadow p-4 min-h-[100px] transition-colors duration-300">
      <h2 className="font-semibold text-base mb-2 dark:text-text-main">
        AI Inbox
      </h2>
      <ul className="flex flex-col gap-2 text-xs">
        {items.length === 0 ? (
          <li>- Tidak ada pesan baru -</li>
        ) : (
          items.map((item, idx) => (
            <li key={idx}>
              <span className="text-blue-600 dark:text-blue-400 font-bold mr-1">
                {item.label}:
              </span>
              <span className="text-muted dark:text-text-muted">
                {item.summary}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
