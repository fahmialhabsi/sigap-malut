import React from "react";

export default function AuditTimeline({ items, onAction }) {
  return (
    <div className="bg-card rounded-md shadow-md p-4 flex flex-col gap-3 border border-surface-border">
      <div className="font-semibold text-primary mb-2">
        Activity / Audit Timeline
      </div>
      <div className="flex flex-col gap-2">
        {items && items.length > 0 ? (
          items.map((item, idx) => (
            <div
              key={item.id || idx}
              className="flex items-center gap-2 p-2 rounded bg-muted"
            >
              <span className="text-xs font-semibold text-primary">
                {item.type}
              </span>
              <span className="text-xs text-muted">{item.timeago}</span>
              <span className="text-xs text-muted">{item.user}</span>
              <span className="text-xs text-muted">{item.meta}</span>
              <button
                className="px-2 py-1 rounded bg-accent text-white text-xs font-semibold"
                onClick={() => onAction && onAction(item)}
                aria-label="Take Action"
              >
                Take Action
              </button>
            </div>
          ))
        ) : (
          <div className="text-xs text-muted">No activity</div>
        )}
      </div>
    </div>
  );
}
