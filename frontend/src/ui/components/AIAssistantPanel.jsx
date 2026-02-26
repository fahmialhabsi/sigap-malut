import React from "react";

export default function AIAssistantPanel({ chatHistory, onSend, onAction }) {
  return (
    <div className="bg-card rounded-md shadow-md p-4 flex flex-col gap-3 border border-surface-border">
      <div className="font-semibold text-primary mb-2">AI Assistant</div>
      <div className="flex flex-col gap-2 h-48 overflow-y-auto bg-muted rounded p-2">
        {chatHistory && chatHistory.length > 0 ? (
          chatHistory.map((msg, idx) => (
            <div
              key={idx}
              className="text-xs text-primary bg-white rounded p-1"
            >
              {msg}
            </div>
          ))
        ) : (
          <div className="text-xs text-muted">No chat yet</div>
        )}
      </div>
      <div className="flex gap-2 mt-2">
        <input
          type="text"
          className="flex-1 px-2 py-1 rounded border border-muted text-sm"
          placeholder="Type your question..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && onSend) onSend(e.target.value);
          }}
        />
        <button
          className="px-2 py-1 rounded bg-accent text-white text-xs font-semibold"
          onClick={() => onAction && onAction("recommendation")}
        >
          Auto-generate
        </button>
      </div>
    </div>
  );
}
