import React from "react";
import { useToasts } from "../contexts/ToastContext";

export default function ToastContainer() {
  const { toasts, remove } = useToasts();
  return (
    <div style={{ position: "fixed", right: 20, top: 20, zIndex: 9999 }}>
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`mb-2 p-3 rounded shadow ${t.type === "error" ? "bg-red-600 text-white" : "bg-white text-gray-900"}`}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>{t.message}</div>
            <button onClick={() => remove(t.id)} style={{ marginLeft: 12 }}>
              x
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
