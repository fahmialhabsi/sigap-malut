import React from "react";

export default function ActivityFeed({ activities }) {
  return (
    <div className="rounded-xl border p-4 bg-white shadow-soft flex flex-col gap-2">
      <div className="font-semibold text-ink mb-2">Activity Feed</div>
      {activities?.length === 0 ? (
        <div className="text-xs text-muted">No activities yet.</div>
      ) : (
        activities.map((act, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-primary">{act.user}</span>
            <span>{act.action}</span>
            <span className="text-muted">{act.timeago}</span>
          </div>
        ))
      )}
    </div>
  );
}
