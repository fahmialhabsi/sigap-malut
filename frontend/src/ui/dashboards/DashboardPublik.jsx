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
import api from "../../services/api";
import { executiveTheme } from "./executiveTheme";

const CHART_GRID = "rgba(148, 163, 184, 0.14)";
const CHART_AXIS = "#94a3b8";
const TOOLTIP_STYLE = {
  background: "#0f172a",
  border: "1px solid #334155",
  borderRadius: 16,
  color: "#e2e8f0",
  boxShadow: "0 18px 40px -28px rgba(2, 6, 23, 0.85)",
};
const TOOLTIP_LABEL_STYLE = { color: "#94a3b8" };
const LINK_BUTTON_CLASS =
  "inline-flex items-center rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800";

function Card({ title, subtitle, right, children }) {
  return (
    <section className={executiveTheme.panel}>
      <div className={executiveTheme.panelHeader}>
        <div>
          <div className={executiveTheme.panelTitle}>{title}</div>
          {subtitle ? (
            <div className={executiveTheme.panelSubtitle}>{subtitle}</div>
          ) : null}
        </div>
        {right ? <div className={executiveTheme.panelMeta}>{right}</div> : null}
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

function StatTile({ label, value, hint }) {
  return (
    <div className={executiveTheme.tile}>
      <div className={executiveTheme.tileAccent} aria-hidden />
      <div className={executiveTheme.tileLabel}>{label}</div>
      <div className="mt-2 text-[1.9rem] font-extrabold tracking-tight text-white tabular-nums">
        {value ?? "-"}
      </div>
      {hint ? (
        <div className="mt-1 text-[11px] leading-relaxed text-slate-400">
          {hint}
        </div>
      ) : null}
    </div>
  );
}

function EmptyState({ text }) {
  return <div className={executiveTheme.mutedText}>{text}</div>;
}

function statusToneClass(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "kritis") {
    return "border border-rose-500/25 bg-rose-500/10 text-rose-200";
  }
  if (normalized === "waspada") {
    return "border border-amber-400/25 bg-amber-400/10 text-amber-200";
  }
  return "border border-emerald-500/25 bg-emerald-500/10 text-emerald-200";
}

function formatNumberId(value, digits = 2) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "-";
  return num.toLocaleString("id-ID", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function formatDateId(isoDate) {
  if (!isoDate) return "-";
  try {
    return new Date(isoDate).toLocaleDateString("id-ID");
  } catch {
    return String(isoDate);
  }
}

function labelStatusStok(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "kritis") return "Kritis";
  if (normalized === "waspada") return "Waspada";
  if (normalized === "aman") return "Aman";
  return status || "-";
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
      const [summaryResponse, datasetResponse, inflasiResponse, hargaResponse] =
        await Promise.all([
          api.get("/api/public/summary"),
          api.get("/api/public/datasets"),
          api.get("/api/public/inflasi/trend", { params: { days } }),
          api.get("/api/public/harga/trend", {
            params: { days, komoditas_key: komoditasKey },
          }),
        ]);

      setSummary(summaryResponse.data?.data || null);
      setDatasets(
        Array.isArray(datasetResponse.data?.data) ? datasetResponse.data.data : [],
      );
      setInflasiTrend(
        Array.isArray(inflasiResponse.data?.data) ? inflasiResponse.data.data : [],
      );
      setHargaTrend(
        Array.isArray(hargaResponse.data?.data) ? hargaResponse.data.data : [],
      );
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
    let cancelled = false;

    async function refreshCharts() {
      setLoading(true);
      try {
        const [inflasiResponse, hargaResponse] = await Promise.all([
          api.get("/api/public/inflasi/trend", { params: { days } }),
          api.get("/api/public/harga/trend", {
            params: { days, komoditas_key: komoditasKey },
          }),
        ]);

        if (cancelled) return;

        setInflasiTrend(
          Array.isArray(inflasiResponse.data?.data)
            ? inflasiResponse.data.data
            : [],
        );
        setHargaTrend(
          Array.isArray(hargaResponse.data?.data) ? hargaResponse.data.data : [],
        );
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
      COMMODITY_OPTIONS.find((commodity) => commodity.key === komoditasKey)
        ?.label || komoditasKey
    );
  }, [komoditasKey]);

  return (
    <div className="w-full max-w-none min-w-0 space-y-6">
      <div className={`${executiveTheme.hero} mb-1`}>
        <div className={executiveTheme.heroAccent} aria-hidden />
        <div className={executiveTheme.heroGlow} aria-hidden />

        <div className={executiveTheme.heroInner}>
          <div>
            <div className={executiveTheme.heroKicker}>Portal Data Terbuka</div>
            <div className={executiveTheme.heroTitle}>
              Dashboard Publik Pangan Maluku Utara
            </div>
            <div className={executiveTheme.heroMeta}>
              Akses ringkasan agregat untuk masyarakat, peneliti, dan mitra
            </div>
            <div className={executiveTheme.heroDescription}>
              Pantau indikator inflasi, harga pangan, cadangan CPPD, dan dataset
              terbuka dalam tampilan dark yang konsisten dengan command center
              eksekutif, namun tetap ramah untuk akses publik.
            </div>
          </div>

          <div className={executiveTheme.heroLoginCard}>
            <div className={executiveTheme.heroLoginLabel}>Mode Akses</div>
            <div className={executiveTheme.heroLoginValue}>
              Publik / Tanpa Login
            </div>
          </div>
        </div>
      </div>

      <Card
        title="Portal Data Publik"
        subtitle="Ringkasan data terbuka yang sudah dipublikasikan dalam bentuk agregat."
        right={
          summary?.last_updated_at
            ? `Update: ${formatDateId(summary.last_updated_at)}`
            : null
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatTile
            label="Inflasi DoD (proksi)"
            value={
              summary?.inflasi?.inflasi_dod_persen != null
                ? `${formatNumberId(summary.inflasi.inflasi_dod_persen, 2)}%`
                : "-"
            }
            hint={
              summary?.inflasi?.tanggal
                ? `Tanggal: ${formatDateId(summary.inflasi.tanggal)}`
                : "-"
            }
          />
          <StatTile
            label="Inflasi MTD (proksi)"
            value={
              summary?.inflasi?.inflasi_mtd_persen != null
                ? `${formatNumberId(summary.inflasi.inflasi_mtd_persen, 2)}%`
                : "-"
            }
            hint={
              summary?.inflasi?.coverage_komoditas_persen != null
                ? `Coverage: ${formatNumberId(summary.inflasi.coverage_komoditas_persen, 0)}%`
                : "-"
            }
          />
          <StatTile
            label="Harga pangan"
            value={summary?.harga_pangan?.tanggal_terbaru ? "Tersedia" : "-"}
            hint={
              summary?.harga_pangan?.tanggal_terbaru
                ? `Tanggal: ${formatDateId(summary.harga_pangan.tanggal_terbaru)}`
                : "Belum ada data terverifikasi"
            }
          />
          <StatTile
            label="UMKM tersertifikasi"
            value={summary?.umkm?.umkm_tersertifikasi_count ?? "-"}
            hint="Status sertifikasi tidak sama dengan belum"
          />
          <StatTile
            label="CPPD status agregat"
            value={
              summary?.cppd?.status_keseluruhan
                ? labelStatusStok(summary.cppd.status_keseluruhan)
                : "-"
            }
            hint="Cadangan Pemda Prov. Maluku Utara"
          />
          <StatTile
            label="CPPD tanggal data"
            value={
              summary?.cppd?.tanggal_data
                ? formatDateId(summary.cppd.tanggal_data)
                : "-"
            }
            hint={
              summary?.cppd?.stok_cadangan?.length
                ? `${summary.cppd.stok_cadangan.length} komoditas`
                : "Belum ada agregat"
            }
          />
        </div>

        <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/85 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Catatan Ringkas
          </div>
          <div className="mt-2 space-y-1.5 text-sm leading-relaxed text-slate-300">
            <div>
              <span className="font-semibold text-slate-100">Inflasi:</span>{" "}
              {summary?.catatan?.inflasi || "-"}
            </div>
            <div>
              <span className="font-semibold text-slate-100">Harga:</span>{" "}
              {summary?.catatan?.harga || "-"}
            </div>
            <div>
              <span className="font-semibold text-slate-100">CPPD:</span>{" "}
              {summary?.catatan?.cppd || "-"}
            </div>
          </div>
        </div>
      </Card>

      <Card
        title="CPPD - Cadangan Pangan Pemerintah Daerah Provinsi Maluku Utara"
        subtitle={
          summary?.cppd?.meta?.pemilik_publikasi
            ? `Lokasi utama data stok: ${summary.cppd.meta.lokasi_utama_operasional || "Gudang Bulog Ternate"}. Publikasi: ${summary.cppd.meta.pemilik_publikasi}.`
            : "Ringkasan agregat untuk publik dengan lokasi utama stok Gudang Bulog Ternate."
        }
        right={
          summary?.cppd?.tanggal_data
            ? `Data per ${formatDateId(summary.cppd.tanggal_data)}`
            : null
        }
      >
        {summary?.cppd?.meta?.identifikasi_lokasi ? (
          <p className="mb-4 rounded-2xl border border-slate-800 bg-slate-950/85 p-4 text-xs leading-relaxed text-slate-300">
            <span className="font-semibold text-slate-100">
              Definisi teknis:
            </span>{" "}
            {summary.cppd.meta.identifikasi_lokasi}
          </p>
        ) : null}

        {!summary?.cppd?.stok_cadangan?.length ? (
          <EmptyState
            text={
              summary?.cppd?.catatan ||
              "Belum ada data CPPD yang dapat ditampilkan."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left text-slate-400">
                  <th className="py-3 pr-4 font-medium">Komoditas</th>
                  <th className="py-3 pr-4 font-medium">Volume</th>
                  <th className="py-3 pr-4 font-medium">Status</th>
                  <th className="py-3 pr-4 font-medium">Contoh lokasi</th>
                </tr>
              </thead>
              <tbody>
                {summary.cppd.stok_cadangan.map((row) => (
                  <tr
                    key={row.komoditas_id}
                    className="border-t border-slate-800/80 text-slate-300"
                  >
                    <td className="py-3 pr-4 font-medium text-slate-100">
                      {row.komoditas}
                    </td>
                    <td className="py-3 pr-4 text-slate-100">
                      {formatNumberId(row.volume, 2)} {row.satuan || "ton"}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusToneClass(
                          row.status,
                        )}`}
                      >
                        {labelStatusStok(row.status)}
                      </span>
                    </td>
                    <td className="max-w-[220px] truncate py-3 pr-4 text-xs text-slate-400">
                      {row.contoh_lokasi || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          <a
            className={LINK_BUTTON_CLASS}
            href="/api/public/cppd/summary"
            target="_blank"
            rel="noreferrer"
          >
            Endpoint JSON
          </a>
        </div>
      </Card>

      <Card
        title="Tren Inflasi (Proksi Internal)"
        subtitle={`Rentang ${days} hari terakhir. Untuk publikasi resmi, rujuk BPS.`}
        right={loading ? "Memuat..." : `${inflasiTrend.length} titik`}
      >
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <label className="text-xs text-slate-400">
            Rentang
            <select
              value={days}
              onChange={(event) => setDays(Number(event.target.value))}
              className={`${executiveTheme.input} ml-2 min-w-[120px] py-2 text-xs`}
            >
              {[7, 14, 30, 60, 90, 180, 365].map((option) => (
                <option key={option} value={option}>
                  {option} hari
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={inflasiTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
              <XAxis
                dataKey="tanggal"
                tick={{ fill: CHART_AXIS, fontSize: 11 }}
                axisLine={{ stroke: CHART_GRID }}
                tickLine={{ stroke: CHART_GRID }}
              />
              <YAxis
                tick={{ fill: CHART_AXIS, fontSize: 11 }}
                axisLine={{ stroke: CHART_GRID }}
                tickLine={{ stroke: CHART_GRID }}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                labelStyle={TOOLTIP_LABEL_STYLE}
              />
              <Area
                type="monotone"
                dataKey="inflasi_dod_persen"
                stroke="#38bdf8"
                fill="rgba(56, 189, 248, 0.18)"
                strokeWidth={2}
                name="DoD (%)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card
        title="Tren Harga Pangan (Rerata Terverifikasi)"
        subtitle="Rerata harian per komoditas dari entri survei yang telah terverifikasi."
        right={loading ? "Memuat..." : `${hargaTrend.length} titik`}
      >
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <label className="text-xs text-slate-400">
            Komoditas
            <select
              value={komoditasKey}
              onChange={(event) => setKomoditasKey(event.target.value)}
              className={`${executiveTheme.input} ml-2 min-w-[180px] py-2 text-xs`}
            >
              {COMMODITY_OPTIONS.map((commodity) => (
                <option key={commodity.key} value={commodity.key}>
                  {commodity.label}
                </option>
              ))}
            </select>
          </label>

          <a
            className={LINK_BUTTON_CLASS}
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
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
              <XAxis
                dataKey="tanggal"
                tick={{ fill: CHART_AXIS, fontSize: 11 }}
                axisLine={{ stroke: CHART_GRID }}
                tickLine={{ stroke: CHART_GRID }}
              />
              <YAxis
                tick={{ fill: CHART_AXIS, fontSize: 11 }}
                axisLine={{ stroke: CHART_GRID }}
                tickLine={{ stroke: CHART_GRID }}
              />
              <Tooltip
                formatter={(value) =>
                  Number(value).toLocaleString("id-ID", {
                    maximumFractionDigits: 0,
                  })
                }
                contentStyle={TOOLTIP_STYLE}
                labelStyle={TOOLTIP_LABEL_STYLE}
              />
              <Area
                type="monotone"
                dataKey="harga_avg"
                stroke="#34d399"
                fill="rgba(52, 211, 153, 0.18)"
                strokeWidth={2}
                name={`${activeCommodityLabel} (Rp/kg)`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left text-slate-400">
                <th className="py-3 pr-4 font-medium">Tanggal</th>
                <th className="py-3 pr-4 font-medium">Harga (avg)</th>
                <th className="py-3 pr-4 font-medium">N</th>
              </tr>
            </thead>
            <tbody>
              {(hargaTrend || [])
                .slice(-10)
                .reverse()
                .map((row) => (
                  <tr
                    key={row.tanggal}
                    className="border-t border-slate-800/80 text-slate-300"
                  >
                    <td className="py-3 pr-4 text-slate-100">
                      {formatDateId(row.tanggal)}
                    </td>
                    <td className="py-3 pr-4 text-slate-100">
                      {row.harga_avg != null
                        ? Number(row.harga_avg).toLocaleString("id-ID", {
                            maximumFractionDigits: 0,
                          })
                        : "-"}
                    </td>
                    <td className="py-3 pr-4 text-slate-400">{row.n ?? "-"}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          <div className="mt-2 text-[11px] text-slate-500">
            Menampilkan 10 hari terakhir untuk komoditas terpilih.
          </div>
        </div>
      </Card>

      <Card
        title="Dataset Publik"
        subtitle="Daftar dataset agregat yang tersedia untuk publik dan peneliti."
        right={loading ? "Memuat..." : `${datasets.length} dataset`}
      >
        {datasets.length === 0 ? (
          <EmptyState text="Belum ada dataset yang terdaftar." />
        ) : (
          <div className="space-y-3">
            {datasets.map((dataset) => (
              <div key={dataset.id} className={executiveTheme.itemCard}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-100">
                      {dataset.name}
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      {dataset.description}
                    </div>
                    {dataset.caution ? (
                      <div className="mt-2 text-[11px] font-medium text-amber-300">
                        {dataset.caution}
                      </div>
                    ) : null}
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    Update: {formatDateId(dataset.last_updated)}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {dataset.endpoints?.trend ? (
                    <a
                      className={LINK_BUTTON_CLASS}
                      href={dataset.endpoints.trend}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Endpoint trend
                    </a>
                  ) : null}
                  {dataset.endpoints?.download_csv ? (
                    <a
                      className={LINK_BUTTON_CLASS}
                      href={dataset.endpoints.download_csv}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Download CSV
                    </a>
                  ) : null}
                  {dataset.endpoints?.detail ? (
                    <a
                      className={LINK_BUTTON_CLASS}
                      href={dataset.endpoints.detail}
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
