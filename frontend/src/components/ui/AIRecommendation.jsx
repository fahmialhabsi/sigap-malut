import React from "react";

export default function AIRecommendation({ recommendations }) {
  return (
    <div className="rounded-xl border p-4 bg-white shadow-soft flex flex-col gap-2">
      <div className="font-semibold text-ink mb-2">AI Recommendation</div>
      {recommendations?.length === 0 ? (
        <div className="text-xs text-muted">No recommendations yet.</div>
      ) : (
        recommendations.map((rec, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-primary">{rec.title}</span>
            <span>Impact: {rec.impact_est}</span>
            <span className="text-muted">{rec.cost_est}</span>
          </div>
        ))
      )}
    </div>
  );
}
