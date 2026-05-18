// components/tasks/TaskDiscussionPanel.jsx
// Panel diskusi per-tugas — pengirim & penerima dalam satu thread.
// Endpoint: GET/POST /api/tasks/:taskId/discussions
import React, { useState, useEffect, useRef, useCallback } from "react";
import api from "../../services/api";
import useAuthStore from "../../stores/authStore";

const PLACEHOLDER_NO_TASK =
  "Pilih sebuah tugas terlebih dahulu untuk melihat atau menulis diskusi.";

export default function TaskDiscussionPanel({ taskId, penerimaId, className = "" }) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [pesan, setPesan] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);

  const load = useCallback(async () => {
    if (!taskId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/tasks/${taskId}/discussions`);
      setMessages(res.data?.data ?? []);
    } catch (e) {
      setError("Gagal memuat diskusi.");
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!pesan.trim() || !taskId) return;
    const targetPenerima = penerimaId ?? null;
    if (!targetPenerima) {
      setError("Tidak ada penerima ditentukan untuk diskusi ini.");
      return;
    }
    setSending(true);
    setError(null);
    try {
      await api.post(`/tasks/${taskId}/discussions`, {
        penerima_id: targetPenerima,
        pesan: pesan.trim(),
      });
      setPesan("");
      await load();
    } catch (e) {
      setError(e?.response?.data?.message ?? "Gagal mengirim pesan.");
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!taskId) {
    return (
      <div className={`flex items-center justify-center h-40 text-gray-400 text-sm ${className}`}>
        {PLACEHOLDER_NO_TASK}
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Judul */}
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
        Diskusi Tugas #{taskId}
      </div>

      {/* Daftar pesan */}
      <div className="flex-1 overflow-y-auto max-h-64 space-y-2 pr-1">
        {loading && (
          <p className="text-xs text-gray-400 text-center py-4">Memuat diskusi…</p>
        )}
        {!loading && messages.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">
            Belum ada pesan. Mulai diskusi di bawah.
          </p>
        )}
        {messages.map((m) => {
          const isMine = m.pengirim_id === user?.id || m.pengirim_nama === user?.name;
          return (
            <div
              key={m.id}
              className={`flex flex-col gap-0.5 ${isMine ? "items-end" : "items-start"}`}
            >
              <span className="text-[10px] text-gray-400">
                {isMine ? "Anda" : (m.pengirim_nama ?? "—")}
              </span>
              <div
                className={`max-w-[80%] px-3 py-2 rounded-lg text-sm leading-snug ${
                  isMine
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-gray-100 text-gray-800 rounded-bl-none"
                }`}
              >
                {m.pesan}
              </div>
              <span className="text-[10px] text-gray-300">
                {m.created_at
                  ? new Date(m.created_at).toLocaleString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500 bg-red-50 rounded px-2 py-1">{error}</p>
      )}

      {/* Input */}
      <div className="flex gap-2 items-end mt-1">
        <textarea
          rows={2}
          value={pesan}
          onChange={(e) => setPesan(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Tulis pesan diskusi… (Enter kirim, Shift+Enter baris baru)"
          className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-50"
          disabled={sending}
        />
        <button
          onClick={handleSend}
          disabled={sending || !pesan.trim()}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg
                     hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed
                     transition-colors whitespace-nowrap"
        >
          {sending ? "…" : "Kirim"}
        </button>
      </div>
    </div>
  );
}
