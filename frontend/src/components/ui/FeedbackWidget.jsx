import React from "react";

export default function FeedbackWidget({ feedbacks }) {
  return (
    <div className="rounded-xl border p-4 bg-white shadow-soft flex flex-col gap-2">
      <div className="font-semibold text-ink mb-2">Feedback Widget</div>
      {feedbacks?.length === 0 ? (
        <div className="text-xs text-muted">No feedback yet.</div>
      ) : (
        feedbacks.map((fb, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-primary">{fb.user}</span>
            <span>{fb.message}</span>
            <span className="text-muted">{fb.status}</span>
          </div>
        ))
      )}
    </div>
  );
}
