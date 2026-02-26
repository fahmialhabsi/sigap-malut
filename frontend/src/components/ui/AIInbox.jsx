import React from "react";

export default function AIInbox({ items }) {
  return (
    <div className="rounded-xl border p-4 bg-white shadow-soft flex flex-col gap-2">
      <div className="font-semibold text-ink mb-2">AI Inbox</div>
      {items?.length === 0 ? (
        <div className="text-xs text-muted">No AI items yet.</div>
      ) : (
        items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-primary">{item.title}</span>
            <span>Confidence: {item.confidence}</span>
            <span className="text-muted">{item.category}</span>
          </div>
        ))
      )}
    </div>
  );
}
