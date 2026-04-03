import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";

const LANES = {
  GUBERNUR_KADIN: "gubernur_kadin",
  KADIN_ES3: "kadin_es3",
  ES3_ES4: "es3_es4",
  ES4_OPERATOR: "es4_operator",
};

const ANCHOR = {
  INSTRUKSI: "instruksi_gubernur",
  TASK: "task",
};

export default function ClarificationThreadPanel({
  anchorType = ANCHOR.TASK,
  anchorId,
  lane = LANES.KADIN_ES3,
  title = "Diskusi / tanya jawab",
  subtitle,
  compact = false,
}) {
  const [messages, setMessages] = useState([]);
  const [threadId, setThreadId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [body, setBody] = useState("");

  const load = useCallback(async () => {
    if (!anchorId) return;
    setLoading(true);
    try {
      const res = await api.post("/api/clarification/threads", {
        anchor_type: anchorType,
        anchor_id: Number(anchorId),
        lane,
      });
      setThreadId(res.data?.data?.id || null);
      setMessages(Array.isArray(res.data?.messages) ? res.data.messages : []);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Gagal memuat diskusi");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [anchorType, anchorId, lane]);

  useEffect(() => {
    load();
  }, [load]);

  async function send(e) {
    e?.preventDefault();
    const t = String(body || "").trim();
    if (!t || !threadId) return;
    setSending(true);
    try {
      await api.post(`/api/clarification/threads/${threadId}/messages`, {
        body: t,
      });
      setBody("");
      await load();
      toast.success("Pesan terkirim");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Gagal mengirim");
    } finally {
      setSending(false);
    }
  }

  if (!anchorId) {
    return (
      <div className="rounded-xl border border-dashed border-slate-600 bg-slate-950/40 p-4 text-xs text-slate-500">
        Pilih item untuk membuka kanal diskusi.
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border border-slate-700/80 bg-slate-950/50 ${compact ? "p-3" : "p-4"}`}
    >
      <div className="mb-2">
        <div className="text-sm font-bold text-slate-100">{title}</div>
        {subtitle ? (
          <div className="text-[11px] text-slate-500 mt-0.5">{subtitle}</div>
        ) : null}
        <div className="text-[10px] text-slate-600 mt-1 font-mono">
          {anchorType} #{anchorId} · {lane}
        </div>
      </div>

      <div
        className={`space-y-2 overflow-y-auto border border-slate-800 rounded-lg bg-slate-900/40 ${compact ? "max-h-40" : "max-h-64"} p-2 mb-2`}
      >
        {loading ? (
          <div className="text-xs text-slate-500 animate-pulse">Memuat…</div>
        ) : messages.length === 0 ? (
          <div className="text-xs text-slate-500 italic">Belum ada pesan.</div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className="rounded-lg border border-slate-800/80 bg-slate-900/80 px-2 py-1.5"
            >
              <div className="text-[10px] text-slate-500 flex justify-between gap-2">
                <span>
                  {m.author?.nama_lengkap ||
                    m.author?.username ||
                    `User #${m.author_id}`}
                </span>
                <span>
                  {m.created_at
                    ? new Date(m.created_at).toLocaleString("id-ID")
                    : ""}
                </span>
              </div>
              <div className="text-xs text-slate-200 whitespace-pre-wrap mt-0.5">
                {m.body}
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={send} className="flex flex-col gap-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Tulis pertanyaan atau tanggapan…"
          rows={compact ? 2 : 3}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-slate-100 placeholder:text-slate-600"
        />
        <button
          type="submit"
          disabled={sending || !threadId}
          className="self-end text-xs font-semibold px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-50"
        >
          {sending ? "Mengirim…" : "Kirim"}
        </button>
      </form>
    </div>
  );
}

export { LANES, ANCHOR };
