// components/notifications/NotificationCenter.jsx
// Bell icon dengan dropdown in-app notifications (polling setiap 30 detik)
import { useState, useEffect, useRef } from "react";
import { notificationService } from "../../services/taskService";

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef();

  useEffect(() => {
    let cancelled = false;
    const fetchNotifs = async () => {
      try {
        const res = await notificationService.list({ limit: 20 });
        if (!cancelled) {
          setItems(res.data.data || []);
          setUnread(res.data.unread || 0);
        }
      } catch {
        // silent fail
      }
    };
    fetchNotifs();
    const timer = setInterval(fetchNotifs, 30_000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markRead = async (id) => {
    await notificationService.markRead(id).catch(() => {});
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, seen: true } : n)),
    );
    setUnread((p) => Math.max(0, p - 1));
  };

  const markAll = async () => {
    await notificationService.markAllRead().catch(() => {});
    setItems((prev) => prev.map((n) => ({ ...n, seen: true })));
    setUnread(0);
  };

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen((p) => !p)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          position: "relative",
          padding: 6,
        }}
        aria-label="Notifikasi"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span
            style={{
              position: "absolute",
              top: 2,
              right: 2,
              background: "#dc2626",
              color: "#fff",
              borderRadius: "50%",
              width: 16,
              height: 16,
              fontSize: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
            }}
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "110%",
            width: 340,
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
            zIndex: 10000,
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid #f1f5f9",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <strong style={{ fontSize: 14 }}>Notifikasi</strong>
            {unread > 0 && (
              <button
                onClick={markAll}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  color: "#2563eb",
                }}
              >
                Tandai semua dibaca
              </button>
            )}
          </div>
          <div style={{ maxHeight: 360, overflowY: "auto" }}>
            {items.length === 0 ? (
              <div
                style={{
                  padding: 24,
                  textAlign: "center",
                  color: "#9ca3af",
                  fontSize: 13,
                }}
              >
                Tidak ada notifikasi
              </div>
            ) : (
              items.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    markRead(n.id);
                    if (n.link) window.location.hash = n.link;
                  }}
                  style={{
                    padding: "10px 16px",
                    cursor: "pointer",
                    background: n.seen ? "#fff" : "#eff6ff",
                    borderBottom: "1px solid #f8fafc",
                    fontSize: 13,
                  }}
                >
                  <div style={{ color: "#111827", lineHeight: 1.5 }}>
                    {n.message}
                  </div>
                  <div style={{ color: "#9ca3af", fontSize: 11, marginTop: 2 }}>
                    {new Date(n.created_at).toLocaleString("id-ID")}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
