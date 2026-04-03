import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";
import ClarificationThreadPanel, {
  ANCHOR,
  LANES,
} from "../clarification/ClarificationThreadPanel.jsx";
import { executiveTheme } from "../../ui/dashboards/executiveTheme";

function TreeNode({ node, depth }) {
  const pad = Math.min(depth * 12, 48);
  return (
    <div className="border-l border-slate-700 pl-2 ml-1" style={{ marginLeft: pad }}>
      <div className="rounded-lg border border-slate-800 bg-slate-950/60 px-2 py-1.5 mb-1">
        <div className="text-xs font-semibold text-slate-100">
          {node.title || `Task #${node.id}`}
        </div>
        <div className="text-[10px] text-slate-500">
          status: {node.status} · dari user #{node.created_by}
        </div>
      </div>
      {Array.isArray(node.children) && node.children.length > 0 ? (
        <div className="space-y-1">
          {node.children.map((c) => (
            <TreeNode key={c.id} node={c} depth={depth + 1} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function RantaiPerintahView({ instruksiList = [], onRefresh }) {
  const [selectedId, setSelectedId] = useState(null);
  const [rantai, setRantai] = useState(null);
  const [loading, setLoading] = useState(false);

  const items = (instruksiList || []).filter(
    (x) => x && String(x.status || "").toLowerCase() !== "draf",
  );

  useEffect(() => {
    if (!selectedId && items[0]?.id) setSelectedId(items[0].id);
  }, [items, selectedId]);

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    setLoading(true);
    api
      .get(`/gubernur/instruksi/${selectedId}/rantai`)
      .then((res) => {
        if (!cancelled) setRantai(res.data?.data || null);
      })
      .catch((e) => {
        toast.error(e?.response?.data?.message || "Gagal memuat rantai");
        setRantai(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_1fr]">
      <div className={executiveTheme.panel}>
        <div className={executiveTheme.panelHeader}>
          <div>
            <div className={executiveTheme.panelTitle}>Instruksi aktif</div>
            <div className={executiveTheme.panelSubtitle}>
              Pilih untuk melihat pohon turunan perintah.
            </div>
          </div>
          <button
            type="button"
            onClick={() => onRefresh?.()}
            className={executiveTheme.buttonSecondary}
          >
            Refresh
          </button>
        </div>
        <div className="p-3 space-y-2 max-h-[480px] overflow-y-auto">
          {items.length === 0 ? (
            <p className="text-xs text-slate-500">Belum ada instruksi terbit.</p>
          ) : (
            items.map((it) => (
              <button
                key={it.id}
                type="button"
                onClick={() => setSelectedId(it.id)}
                className={`w-full text-left rounded-lg border px-2 py-2 text-xs ${
                  selectedId === it.id
                    ? "border-sky-500/60 bg-sky-500/10 text-slate-100"
                    : "border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-600"
                }`}
              >
                <div className="font-semibold truncate">
                  {it.nomor_instruksi || `#${it.id}`} — {it.judul}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {it.status} · KaDin user #{it.assigned_to}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className={executiveTheme.panel}>
          <div className={executiveTheme.panelHeader}>
            <div>
              <div className={executiveTheme.panelTitle}>Pohon turunan</div>
              <div className={executiveTheme.panelSubtitle}>
                Dari perintah KaDin yang bertaut metadata instruksi, lalu
                `sumber_perintah_kadin` ke bawah.
              </div>
            </div>
            <div className={executiveTheme.panelMeta}>
              {rantai?.flat_count != null ? `${rantai.flat_count} tugas terlacak` : "—"}
            </div>
          </div>
          <div className="p-4">
            {loading ? (
              <p className="text-xs text-slate-500 animate-pulse">Memuat rantai…</p>
            ) : !rantai?.trees?.length ? (
              <p className="text-xs text-slate-500">
                Belum ada tugas turunan tercatat untuk instruksi ini.
              </p>
            ) : (
              <div className="space-y-3">
                {rantai.trees.map((t) => (
                  <TreeNode key={t.id} node={t} depth={0} />
                ))}
              </div>
            )}
          </div>
        </div>

        {selectedId ? (
          <ClarificationThreadPanel
            anchorType={ANCHOR.INSTRUKSI}
            anchorId={selectedId}
            lane={LANES.GUBERNUR_KADIN}
            title="Kanal Gubernur ↔ Kepala Dinas"
            subtitle="Klarifikasi arahan strategis untuk instruksi ini."
          />
        ) : null}
      </div>
    </div>
  );
}
