import React, { useState } from "react";
import api from "../../utils/api";

export default function BroadcastFungsionalPelaksanaPanel({ tujuanOptions }) {
  const [pesan, setPesan] = useState("");
  const [tujuan, setTujuan] = useState(tujuanOptions[0]?.value || "");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  return (
    <div className="flex flex-col gap-3">
      <select
        value={tujuan}
        onChange={(e) => setTujuan(e.target.value)}
        className="rounded bg-slate-900 border border-slate-600 text-slate-100 p-2 text-sm"
      >
        {tujuanOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <textarea
        value={pesan}
        onChange={(e) => {
          setPesan(e.target.value.slice(0, 500));
          setResult(null);
        }}
        placeholder="Tuliskan perintah/instruksi…"
        rows={3}
        className="w-full rounded-lg bg-slate-900/70 border border-slate-600/60 text-slate-100 placeholder:text-slate-500 text-sm p-3 resize-none focus:outline-none focus:border-green-400"
      />
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-slate-500">
          {pesan.length}/500 karakter
        </span>
        <button
          disabled={sending || pesan.trim().length === 0}
          onClick={async () => {
            if (!pesan.trim()) return;
            setSending(true);
            setResult(null);
            try {
              const res = await api.post(
                "/notifications/broadcast-fungsional-pelaksana",
                { pesan: pesan.trim(), tujuan },
              );
              const sent = res.data?.sent ?? 0;
              setResult({
                ok: true,
                msg:
                  sent > 0
                    ? `✅ Notifikasi berhasil dikirim.`
                    : "⚠️ Tidak ada penerima terdaftar.",
              });
              setPesan("");
            } catch {
              setResult({
                ok: false,
                msg: "❌ Gagal mengirim notifikasi. Coba lagi.",
              });
            } finally {
              setSending(false);
            }
          }}
          className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold transition"
        >
          {sending ? "Mengirim…" : "📤 Kirim"}
        </button>
      </div>
      {result && (
        <div
          className={`text-sm px-4 py-2 rounded-lg ${
            result.ok
              ? "bg-emerald-900/40 border border-emerald-500/40 text-emerald-200"
              : "bg-red-900/40 border border-red-500/40 text-red-200"
          }`}
        >
          {result.msg}
        </div>
      )}
    </div>
  );
}
