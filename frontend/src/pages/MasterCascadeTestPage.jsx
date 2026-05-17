import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../stores/authStore";
import { normalizeRoleKey } from "../utils/normalizeRole";
import api from "../services/api";
import toast from "react-hot-toast";

function useDebounced(value, ms) {
  const [d, setD] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setD(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return d;
}

/**
 * UAT / referensi: cascade Program → Kegiatan → Sub → Indikator (API /api/migration/master/*).
 */
export default function MasterCascadeTestPage() {
  const user = useAuthStore((s) => s.user);
  const role = normalizeRoleKey(user);

  const [versi, setVersi] = useState([]);
  const [schemaError, setSchemaError] = useState(null);
  const [regulasiVersiId, setRegulasiVersiId] = useState("");
  const [datasetKey, setDatasetKey] = useState("");
  const [qProg, setQProg] = useState("");
  const qProgDebounced = useDebounced(qProg, 300);

  const [programs, setPrograms] = useState([]);
  const [programId, setProgramId] = useState("");
  const [qKeg, setQKeg] = useState("");
  const qKegDebounced = useDebounced(qKeg, 300);
  const [kegiatan, setKegiatan] = useState([]);
  const [kegiatanId, setKegiatanId] = useState("");
  const [qSub, setQSub] = useState("");
  const qSubDebounced = useDebounced(qSub, 300);
  const [subs, setSubs] = useState([]);
  const [subId, setSubId] = useState("");
  const [qInd, setQInd] = useState("");
  const qIndDebounced = useDebounced(qInd, 300);
  const [indikator, setIndikator] = useState([]);
  const [indikatorId, setIndikatorId] = useState("");

  const [mapFrom, setMapFrom] = useState("");
  const [mapTo, setMapTo] = useState("");
  const [mapResult, setMapResult] = useState(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const res = await api.get("/migration/regulasi-versi");
        if (!cancel) {
          setVersi(res.data?.data?.versi ?? []);
          setSchemaError(null);
        }
      } catch (e) {
        const d = e.response?.data;
        if (!cancel) {
          setVersi([]);
          setSchemaError(d?.message || e.message);
        }
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const loadPrograms = useCallback(async () => {
    if (!regulasiVersiId) return;
    try {
      const res = await api.get("/migration/master/programs", {
        params: {
          regulasi_versi_id: regulasiVersiId,
          dataset_key: datasetKey.trim() || undefined,
          q: qProgDebounced.trim() || undefined,
        },
      });
      setPrograms(res.data?.data?.items ?? []);
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
      setPrograms([]);
    }
  }, [regulasiVersiId, datasetKey, qProgDebounced]);

  useEffect(() => {
    loadPrograms();
  }, [loadPrograms]);

  const loadKegiatan = useCallback(async () => {
    if (!regulasiVersiId || !programId) {
      setKegiatan([]);
      return;
    }
    try {
      const res = await api.get("/migration/master/kegiatan", {
        params: {
          regulasi_versi_id: regulasiVersiId,
          master_program_id: programId,
          q: qKegDebounced.trim() || undefined,
        },
      });
      setKegiatan(res.data?.data?.items ?? []);
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
      setKegiatan([]);
    }
  }, [regulasiVersiId, programId, qKegDebounced]);

  useEffect(() => {
    loadKegiatan();
  }, [loadKegiatan]);

  const loadSubs = useCallback(async () => {
    if (!regulasiVersiId || !kegiatanId) {
      setSubs([]);
      return;
    }
    try {
      const res = await api.get("/migration/master/sub-kegiatan", {
        params: {
          regulasi_versi_id: regulasiVersiId,
          master_kegiatan_id: kegiatanId,
          q: qSubDebounced.trim() || undefined,
        },
      });
      setSubs(res.data?.data?.items ?? []);
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
      setSubs([]);
    }
  }, [regulasiVersiId, kegiatanId, qSubDebounced]);

  useEffect(() => {
    loadSubs();
  }, [loadSubs]);

  const loadIndikator = useCallback(async () => {
    if (!regulasiVersiId || !subId) {
      setIndikator([]);
      return;
    }
    try {
      const res = await api.get("/migration/master/indikator", {
        params: {
          regulasi_versi_id: regulasiVersiId,
          master_sub_kegiatan_id: subId,
          dataset_key: datasetKey.trim() || undefined,
          q: qIndDebounced.trim() || undefined,
        },
      });
      setIndikator(res.data?.data?.items ?? []);
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
      setIndikator([]);
    }
  }, [regulasiVersiId, subId, datasetKey, qIndDebounced]);

  useEffect(() => {
    loadIndikator();
  }, [loadIndikator]);

  const selectionSnapshot = useMemo(
    () => ({
      regulasi_versi_id: regulasiVersiId ? Number(regulasiVersiId) : null,
      dataset_key: datasetKey.trim() || null,
      master_program_id: programId ? Number(programId) : null,
      master_kegiatan_id: kegiatanId ? Number(kegiatanId) : null,
      master_sub_kegiatan_id: subId ? Number(subId) : null,
      master_indikator_id: indikatorId ? Number(indikatorId) : null,
    }),
    [regulasiVersiId, datasetKey, programId, kegiatanId, subId, indikatorId],
  );

  if (role !== "super_admin") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 text-ink">
      <div>
        <h1 className="text-2xl font-bold">UAT — Master cascade</h1>
        <p className="text-sm text-muted mt-1">
          Route <code className="text-xs">/admin/master-cascade-test</code> — referensi dropdown untuk form & UAT.
          Hanya super admin.
        </p>
      </div>

      {schemaError ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          {schemaError} — pastikan migrasi backend (regulasi + master_indikator) sudah dijalankan.
        </div>
      ) : null}

      <section className="rounded-xl border border-exec-border bg-card p-4 space-y-3 shadow-soft-sm">
        <h2 className="font-semibold">Filter</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm flex flex-col gap-1">
            <span className="text-muted">regulasi_versi_id</span>
            <select
              className="border rounded-lg px-3 py-2 bg-bg"
              value={regulasiVersiId}
              onChange={(e) => {
                setRegulasiVersiId(e.target.value);
                setProgramId("");
                setKegiatanId("");
                setSubId("");
                setIndikatorId("");
              }}
            >
              <option value="">— pilih versi —</option>
              {versi.map((v) => (
                <option key={v.id} value={v.id}>
                  #{v.id} {v.nama_regulasi} ({v.tahun})
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm flex flex-col gap-1">
            <span className="text-muted">dataset_key (opsional, strict filter program & indikator)</span>
            <input
              className="border rounded-lg px-3 py-2 bg-bg"
              value={datasetKey}
              onChange={(e) => setDatasetKey(e.target.value)}
              placeholder="mis. OPD_DEFAULT"
            />
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-exec-border bg-card p-4 space-y-3 shadow-soft-sm">
        <h2 className="font-semibold">Program</h2>
        <input
          className="w-full border rounded-lg px-3 py-2 bg-bg text-sm"
          placeholder="Cari kode / nama (debounce 300ms)…"
          value={qProg}
          onChange={(e) => setQProg(e.target.value)}
          disabled={!regulasiVersiId}
        />
        <select
          className="w-full border rounded-lg px-3 py-2 bg-bg"
          value={programId}
          disabled={!regulasiVersiId}
          onChange={(e) => {
            setProgramId(e.target.value);
            setKegiatanId("");
            setSubId("");
            setIndikatorId("");
          }}
        >
          <option value="">— pilih program —</option>
          {programs.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </section>

      <section className="rounded-xl border border-exec-border bg-card p-4 space-y-3 shadow-soft-sm">
        <h2 className="font-semibold">Kegiatan</h2>
        <input
          className="w-full border rounded-lg px-3 py-2 bg-bg text-sm"
          placeholder="Cari kode / nama…"
          value={qKeg}
          onChange={(e) => setQKeg(e.target.value)}
          disabled={!programId}
        />
        <select
          className="w-full border rounded-lg px-3 py-2 bg-bg"
          value={kegiatanId}
          disabled={!programId}
          onChange={(e) => {
            setKegiatanId(e.target.value);
            setSubId("");
            setIndikatorId("");
          }}
        >
          <option value="">— pilih kegiatan —</option>
          {kegiatan.map((k) => (
            <option key={k.id} value={k.id}>
              {k.label}
            </option>
          ))}
        </select>
      </section>

      <section className="rounded-xl border border-exec-border bg-card p-4 space-y-3 shadow-soft-sm">
        <h2 className="font-semibold">Sub kegiatan</h2>
        <input
          className="w-full border rounded-lg px-3 py-2 bg-bg text-sm"
          placeholder="Cari kode / nama…"
          value={qSub}
          onChange={(e) => setQSub(e.target.value)}
          disabled={!kegiatanId}
        />
        <select
          className="w-full border rounded-lg px-3 py-2 bg-bg"
          value={subId}
          disabled={!kegiatanId}
          onChange={(e) => {
            setSubId(e.target.value);
            setIndikatorId("");
          }}
        >
          <option value="">— pilih sub kegiatan —</option>
          {subs.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </section>

      <section className="rounded-xl border border-exec-border bg-card p-4 space-y-3 shadow-soft-sm">
        <h2 className="font-semibold">Indikator</h2>
        <p className="text-xs text-muted">
          Membutuhkan tabel <code>master_indikator</code> (migrasi 20260418100000). Jika kosong, data belum diisi.
        </p>
        <input
          className="w-full border rounded-lg px-3 py-2 bg-bg text-sm"
          placeholder="Cari kode / nama…"
          value={qInd}
          onChange={(e) => setQInd(e.target.value)}
          disabled={!subId}
        />
        <select
          className="w-full border rounded-lg px-3 py-2 bg-bg"
          value={indikatorId}
          disabled={!subId}
          onChange={(e) => setIndikatorId(e.target.value)}
        >
          <option value="">— pilih indikator —</option>
          {indikator.map((i) => (
            <option key={i.id} value={i.id}>
              {i.label}
            </option>
          ))}
        </select>
      </section>

      <section className="rounded-xl border border-dashed border-muted p-4 text-sm font-mono bg-bg/50">
        <div className="font-sans font-semibold text-ink mb-2">Snapshot pilihan (JSON)</div>
        <pre className="text-xs overflow-auto whitespace-pre-wrap">{JSON.stringify(selectionSnapshot, null, 2)}</pre>
      </section>

      <section className="rounded-xl border border-exec-border bg-card p-4 space-y-3 shadow-soft-sm">
        <h2 className="font-semibold">Auto-mapping lite (uji)</h2>
        <p className="text-xs text-muted">
          POST <code>/api/migration/run-auto-mapping-lite</code> — kode sama dalam jalur prog+keg → approved; nama sub
          sama dalam jalur → approved; lainnya pending.
        </p>
        <div className="flex flex-wrap gap-2 items-center">
          <select
            className="border rounded-lg px-2 py-2 bg-bg text-sm"
            value={mapFrom}
            onChange={(e) => setMapFrom(e.target.value)}
          >
            <option value="">from</option>
            {versi.map((v) => (
              <option key={`mf-${v.id}`} value={v.id}>
                #{v.id}
              </option>
            ))}
          </select>
          <span>→</span>
          <select
            className="border rounded-lg px-2 py-2 bg-bg text-sm"
            value={mapTo}
            onChange={(e) => setMapTo(e.target.value)}
          >
            <option value="">to</option>
            {versi.map((v) => (
              <option key={`mt-${v.id}`} value={v.id}>
                #{v.id}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="px-3 py-2 rounded-lg bg-slate-800 text-white text-sm"
            onClick={async () => {
              if (!mapFrom || !mapTo) {
                toast.error("Pilih versi from dan to");
                return;
              }
              try {
                const res = await api.post("/migration/run-auto-mapping-lite", {
                  regulasi_versi_from_id: Number(mapFrom),
                  regulasi_versi_to_id: Number(mapTo),
                });
                setMapResult(res.data?.data ?? null);
                toast.success(res.data?.message || "Selesai");
              } catch (e) {
                toast.error(e.response?.data?.message || e.message);
                setMapResult(null);
              }
            }}
          >
            Jalankan
          </button>
        </div>
        {mapResult ? (
          <pre className="text-xs overflow-auto max-h-64 bg-bg p-2 rounded border">{JSON.stringify(mapResult, null, 2)}</pre>
        ) : null}
      </section>
    </div>
  );
}
