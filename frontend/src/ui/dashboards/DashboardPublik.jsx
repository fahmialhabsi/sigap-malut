import React, { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "../../utils/api";

function Card({ title, subtitle, right, children }) {
  return (
    <section className="rounded-2xl border border-exec-border bg-white/95 shadow-sm p-5 sm:p-6 w-full min-w-0">
      <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
        <div>
          <div className="text-sm font-semibold text-exec-ink">{title}</div>
          {subtitle ? (
            <div className="text-xs text-exec-muted mt-1">{subtitle}</div>
          ) : null}
        </div>
        {right ? <div className="text-xs text-exec-muted">{right}</div> : null}
      </div>
      {children}
    </section>
  );
}

function StatTile({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-exec-border bg-gradient-to-br from-white via-teal-50/25 to-rose-50/20 p-4 shadow-sm ring-1 ring-teal-50">
      <div className="text-xs text-exec-muted font-medium">{label}</div>
      <div className="text-2xl font-bold text-teal-800 mt-1 tabular-nums">
        {value ?? "—"}
      </div>
      {hint ? <div className="text-[11px] text-exec-muted mt-1">{hint}</div> : null}
    </div>
  );
}

function formatNumberId(n, digits = 2) {
  const num = Number(n);
  if (!Number.isFinite(num)) return "—";
  return num.toLocaleString("id-ID", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function formatDateId(isoDate) {
  if (!isoDate) return "—";
  try {
    return new Date(isoDate).toLocaleDateString("id-ID");
  } catch {
    return String(isoDate);
  }
}

function labelStatusStok(s) {
  const x = String(s || "").toLowerCase();
  if (x === "kritis") return "Kritis";
  if (x === "waspada") return "Waspada";
  if (x === "aman") return "Aman";
  return s || "—";
}

const COMMODITY_OPTIONS = [
  { key: "beras_medium", label: "Beras Medium" },
  { key: "beras_premium", label: "Beras Premium" },
  { key: "minyak_goreng", label: "Minyak Goreng" },
  { key: "gula_pasir", label: "Gula Pasir" },
  { key: "telur_ayam", label: "Telur Ayam" },
  { key: "cabai_merah", label: "Cabai Merah" },
];

export default function DashboardPublik() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [datasets, setDatasets] = useState([]);
  const [inflasiTrend, setInflasiTrend] = useState([]);
  const [hargaTrend, setHargaTrend] = useState([]);
  const [days, setDays] = useState(30);
  const [komoditasKey, setKomoditasKey] = useState("beras_medium");

  async function loadAll() {
    setLoading(true);
    try {
      const [s, d, it, ht] = await Promise.all([
        api.get("/api/public/summary"),
        api.get("/api/public/datasets"),
        api.get("/api/public/inflasi/trend", { params: { days } }),
        api.get("/api/public/harga/trend", {
          params: { days, komoditas_key: komoditasKey },
        }),
      ]);
      setSummary(s.data?.data || null);
      setDatasets(Array.isArray(d.data?.data) ? d.data.data : []);
      setInflasiTrend(Array.isArray(it.data?.data) ? it.data.data : []);
      setHargaTrend(Array.isArray(ht.data?.data) ? ht.data.data : []);
    } catch {
      setSummary(null);
      setDatasets([]);
      setInflasiTrend([]);
      setHargaTrend([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // refresh charts only when filters change (avoid refetching summary)
    let cancelled = false;
    async function refreshCharts() {
      setLoading(true);
      try {
        const [it, ht] = await Promise.all([
          api.get("/api/public/inflasi/trend", { params: { days } }),
          api.get("/api/public/harga/trend", {
            params: { days, komoditas_key: komoditasKey },
          }),
        ]);
        if (cancelled) return;
        setInflasiTrend(Array.isArray(it.data?.data) ? it.data.data : []);
        setHargaTrend(Array.isArray(ht.data?.data) ? ht.data.data : []);
      } catch {
        if (cancelled) return;
        setInflasiTrend([]);
        setHargaTrend([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    refreshCharts();
    return () => {
      cancelled = true;
    };
  }, [days, komoditasKey]);

  const activeCommodityLabel = useMemo(() => {
    return (
      COMMODITY_OPTIONS.find((c) => c.key === komoditasKey)?.label ||
      komoditasKey
    );
  }, [komoditasKey]);

  return (
    <div className="space-y-6 w-full min-w-0 max-w-none">
      <Card
        title="Portal Data Publik"
        subtitle="Ringkasan data terbuka yang sudah dipublikasikan (agregat)."
        right={summary?.last_updated_at ? `Update: ${formatDateId(summary.last_updated_at)}` : null}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatTile
            label="Inflasi DoD (proksi)"
            value={
              summary?.inflasi?.inflasi_dod_persen != null
                ? `${formatNumberId(summary.inflasi.inflasi_dod_persen, 2)}%`
                : "—"
            }
            hint={
              summary?.inflasi?.tanggal
                ? `Tanggal: ${formatDateId(summary.inflasi.tanggal)}`
                : "—"
            }
          />
          <StatTile
            label="Inflasi MTD (proksi)"
            value={
              summary?.inflasi?.inflasi_mtd_persen != null
                ? `${formatNumberId(summary.inflasi.inflasi_mtd_persen, 2)}%`
                : "—"
            }
            hint={
              summary?.inflasi?.coverage_komoditas_persen != null
                ? `Coverage: ${formatNumberId(summary.inflasi.coverage_komoditas_persen, 0)}%`
                : "—"
            }
          />
          <StatTile
            label="Harga pangan (terverifikasi)"
            value={summary?.harga_pangan?.tanggal_terbaru ? "Tersedia" : "—"}
            hint={
              summary?.harga_pangan?.tanggal_terbaru
                ? `Tanggal: ${formatDateId(summary.harga_pangan.tanggal_terbaru)}`
                : "Belum ada data terverifikasi"
            }
          />
          <StatTile
            label="UMKM tersertifikasi"
            value={summary?.umkm?.umkm_tersertifikasi_count ?? "—"}
            hint="Status sertifikasi ≠ 'belum'"
          />
          <StatTile
            label="CPPD — status agregat"
            value={
              summary?.cppd?.status_keseluruhan
                ? labelStatusStok(summary.cppd.status_keseluruhan)
                : "—"
            }
            hint="Cadangan Pemda Prov. Maluku Utara"
          />
          <StatTile
            label="CPPD — tanggal data"
            value={
              summary?.cppd?.tanggal_data
                ? formatDateId(summary.cppd.tanggal_data)
                : "—"
            }
            hint={
              summary?.cppd?.stok_cadangan?.length
                ? `${summary.cppd.stok_cadangan.length} komoditas`
                : "Belum ada agregat"
            }
          />
        </div>

        <div className="mt-4 text-[12px] text-exec-muted leading-relaxed">
          <div>
            <span className="font-semibold text-exec-ink">Catatan:</span>{" "}
            {summary?.catatan?.inflasi || "—"}
          </div>
          <div className="mt-1">{summary?.catatan?.harga || "—"}</div>
          <div className="mt-1">{summary?.catatan?.cppd || "—"}</div>
        </div>
      </Card>

      <Card
        title="CPPD — Cadangan Pangan Pemerintah Daerah Provinsi Maluku Utara"
        subtitle={
          summary?.cppd?.meta?.pemilik_publikasi
            ? `Lokasi utama data stok: ${summary.cppd.meta.lokasi_utama_operasional || "Gudang Bulog Ternate"}. Publikasi: ${summary.cppd.meta.pemilik_publikasi}.`
            : "Ringkasan agregat untuk publik; lokasi utama stok: Gudang Bulog Ternate."
        }
        right={
          summary?.cppd?.tanggal_data
            ? `Data per ${formatDateId(summary.cppd.tanggal_data)}`
            : null
        }
      >
        {summary?.cppd?.meta?.identifikasi_lokasi ? (
          <p className="text-[11px] text-muted mb-3 leading-relaxed">
            <span className="font-semibold text-exec-ink">Definisi teknis: </span>
            {summary.cppd.meta.identifikasi_lokasi}
          </p>
        ) : null}

        {!summary?.cppd?.stok_cadangan?.length ? (
          <div className="text-sm text-muted">
            {summary?.cppd?.catatan ||
              "Belum ada data CPPD yang dapat ditampilkan."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-muted">
                  <th className="py-2 pr-4">Komoditas</th>
                  <th className="py-2 pr-4">Volume</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Contoh lokasi</th>
                </tr>
              </thead>
              <tbody>
                {summary.cppd.stok_cadangan.map((row) => (
                  <tr key={row.komoditas_id} className="border-t border-exec-border/80">
                    <td className="py-2 pr-4 text-exec-ink font-medium">
                      {row.komoditas}
                    </td>
                    <td className="py-2 pr-4 text-exec-ink">
                      {formatNumberId(row.volume, 2)} {row.satuan || "ton"}
                    </td>
                    <td className="py-2 pr-4">
                      <span
                        className={
                          row.status === "kritis"
                            ? "text-red-600 font-medium"
                            : row.status === "waspada"
                              ? "text-amber-700 font-medium"
                              : "text-emerald-700 font-medium"
                        }
                      >
                        {labelStatusStok(row.status)}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-muted text-xs max-w-[200px] truncate">
                      {row.contoh_lokasi || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <a
            className="text-xs px-3 py-1.5 rounded-lg border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-900 font-medium transition-colors"
            href="/api/public/cppd/summary"
            target="_blank"
            rel="noreferrer"
          >
            Endpoint JSON (peneliti)
          </a>
        </div>
      </Card>

      <Card
        title="Tren Inflasi (Proksi Internal)"
        subtitle={`Rentang ${days} hari terakhir. Untuk publikasi resmi, rujuk BPS.`}
        right={loading ? "Memuat…" : `${inflasiTrend.length} titik`}
      >
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <label className="text-xs text-muted">
            Rentang
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="ml-2 rounded-lg border border-exec-border bg-white px-2 py-1 text-xs text-exec-ink shadow-inner"
            >
              {[7, 14, 30, 60, 90, 180, 365].map((d) => (
                <option key={d} value={d}>
                  {d} hari
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={inflasiTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(15, 23, 42, 0.08)" />
              <XAxis dataKey="tanggal" tick={{ fill: "#64748b", fontSize: 11 }} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  color: "#0f172a",
                }}
                labelStyle={{ color: "#64748b" }}
              />
              <Area
                type="monotone"
                dataKey="inflasi_dod_persen"
                stroke="#0b5fff"
                fill="rgba(11,95,255,0.18)"
                name="DoD (%)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card
        title="Tren Harga Pangan (Rerata Terverifikasi)"
        subtitle="Rerata harian per komoditas_key dari entri survei yang terverifikasi."
        right={loading ? "Memuat…" : `${hargaTrend.length} titik`}
      >
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <label className="text-xs text-muted">
            Komoditas
            <select
              value={komoditasKey}
              onChange={(e) => setKomoditasKey(e.target.value)}
              className="ml-2 rounded-lg border border-exec-border bg-white px-2 py-1 text-xs text-exec-ink shadow-inner"
            >
              {COMMODITY_OPTIONS.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>

          <a
            className="text-xs px-3 py-1.5 rounded-lg border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-900 font-medium transition-colors"
            href={`/api/public/datasets/harga-pangan.csv?komoditas_key=${encodeURIComponent(
              komoditasKey,
            )}&days=${encodeURIComponent(days)}`}
            target="_blank"
            rel="noreferrer"
          >
            Download CSV
          </a>
        </div>

        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hargaTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(15, 23, 42, 0.08)" />
              <XAxis dataKey="tanggal" tick={{ fill: "#64748b", fontSize: 11 }} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
              <Tooltip
                formatter={(v) =>
                  Number(v).toLocaleString("id-ID", {
                    maximumFractionDigits: 0,
                  })
                }
                contentStyle={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  color: "#0f172a",
                }}
                labelStyle={{ color: "#64748b" }}
              />
              <Area
                type="monotone"
                dataKey="harga_avg"
                stroke="#22c55e"
                fill="rgba(34,197,94,0.18)"
                name={`${activeCommodityLabel} (Rp/kg)`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-muted">
                <th className="py-2 pr-4">Tanggal</th>
                <th className="py-2 pr-4">Harga (avg)</th>
                <th className="py-2 pr-4">N</th>
              </tr>
            </thead>
            <tbody>
              {(hargaTrend || []).slice(-10).reverse().map((r) => (
                <tr key={r.tanggal} className="border-t border-exec-border/80">
                  <td className="py-2 pr-4 text-exec-ink">{formatDateId(r.tanggal)}</td>
                  <td className="py-2 pr-4 text-exec-ink">
                    {r.harga_avg != null
                      ? Number(r.harga_avg).toLocaleString("id-ID", {
                          maximumFractionDigits: 0,
                        })
                      : "—"}
                  </td>
                  <td className="py-2 pr-4 text-exec-muted">{r.n ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-2 text-[11px] text-muted">
            Menampilkan 10 hari terakhir untuk komoditas terpilih.
          </div>
        </div>
      </Card>

      <Card
        title="Dataset Publik"
        subtitle="Daftar dataset yang tersedia untuk publik/peneliti (agregat)."
        right={loading ? "Memuat…" : `${datasets.length} dataset`}
      >
        {datasets.length === 0 ? (
          <div className="text-sm text-muted">
            Belum ada dataset yang terdaftar.
          </div>
        ) : (
          <div className="space-y-3">
            {datasets.map((ds) => (
              <div
                key={ds.id}
                className="rounded-xl border border-exec-border bg-slate-50/90 p-4"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="text-sm font-semibold text-exec-ink">
                      {ds.name}
                    </div>
                    <div className="text-xs text-exec-muted mt-1">{ds.description}</div>
                    {ds.caution ? (
                      <div className="text-[11px] text-amber-800 mt-2 font-medium">
                        {ds.caution}
                      </div>
                    ) : null}
                  </div>
                  <div className="text-right text-xs text-muted">
                    Update: {formatDateId(ds.last_updated)}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {ds.endpoints?.trend ? (
                    <a
                      className="text-xs px-3 py-1.5 rounded-lg border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-900 font-medium transition-colors"
                      href={ds.endpoints.trend}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Lihat endpoint trend
                    </a>
                  ) : null}
                  {ds.endpoints?.download_csv ? (
                    <a
                      className="text-xs px-3 py-1.5 rounded-lg border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-900 font-medium transition-colors"
                      href={ds.endpoints.download_csv}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Download CSV
                    </a>
                  ) : null}
                  {ds.endpoints?.detail ? (
                    <a
                      className="text-xs px-3 py-1.5 rounded-lg border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-900 font-medium transition-colors"
                      href={ds.endpoints.detail}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Detail JSON
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
