import React from "react";

export default function QuickAction({ actions }) {
  return (
    <div className="flex gap-2">
      {actions.map((action, idx) => (
        <button
          key={idx}
          className="px-4 py-2 rounded bg-primary text-white font-semibold shadow-soft hover:bg-primary-600 transition"
          aria-label={action.label}
          onClick={action.onClick}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
