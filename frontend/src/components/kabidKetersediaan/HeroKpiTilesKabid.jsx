import React from "react";

function renderTiles(tiles, colorMap) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className={`rounded-xl border p-4 flex flex-col gap-1 ${colorMap[tile.color]}`}
        >
          <div className="text-xs font-semibold uppercase tracking-wide opacity-80">
            {tile.shortLabel || tile.label}
          </div>
          <div className="text-2xl font-bold">{tile.value}</div>
          <div className="text-xs font-medium opacity-80">{tile.label}</div>
        </div>
      ))}
    </div>
  );
}

const COLOR_MAP = {
  indigo: "bg-indigo-50 border-indigo-200 text-indigo-700",
  amber: "bg-amber-50 border-amber-200 text-amber-700",
  red: "bg-red-50 border-red-200 text-red-700",
  green: "bg-emerald-50 border-emerald-200 text-emerald-700",
  orange: "bg-orange-50 border-orange-200 text-orange-700",
  blue: "bg-blue-50 border-blue-200 text-blue-700",
  emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
};

export default function HeroKpiTilesKabid({
  summary,
  loading,
  variant = "ketersediaan",
}) {
  if (variant === "konsumsi") {
    const tiles = [
      {
        label: "Realisasi SPPG",
        shortLabel: "SPPG",
        value: loading
          ? "..."
          : summary?.sppg_realisasi_persen != null
            ? `${summary.sppg_realisasi_persen}%`
            : "-",
        color: "emerald",
      },
      {
        label: "Skor PPH",
        shortLabel: "PPH",
        value: loading
          ? "..."
          : summary?.pph_skor != null
            ? `${summary.pph_skor}`
            : summary?.skor_pph_capaian?.nilai != null
              ? `${summary.skor_pph_capaian.nilai}`
              : "-",
        color: "blue",
      },
      {
        label: "Keracunan Aktif",
        shortLabel: "Kasus",
        value: loading ? "..." : (summary?.keracunan_aktif ?? "-"),
        color: "red",
      },
      {
        label: "Inspeksi Bulan Ini",
        shortLabel: "Inspeksi",
        value: loading ? "..." : (summary?.inspeksi_bulan_ini ?? "-"),
        color: "amber",
      },
      {
        label: "Deadline Bapanas",
        shortLabel: "Deadline",
        value: loading
          ? "..."
          : summary?.deadline_bapanas_hari != null
            ? `H-${summary.deadline_bapanas_hari}`
            : "-",
        color: "indigo",
      },
      {
        label: "Tugas Tim",
        shortLabel: "Tim",
        value: loading ? "..." : (summary?.tugas_aktif_tim ?? "-"),
        color: "indigo",
      },
    ];

    return renderTiles(tiles, COLOR_MAP);
  }

  if (variant === "distribusi") {
    const inflasiBulanan =
      summary?.inflasi_bulanan && typeof summary.inflasi_bulanan === "object"
        ? summary.inflasi_bulanan.nilai
        : summary?.inflasi_bulanan;

    const tiles = [
      {
        label: "Inflasi Bulanan",
        shortLabel: "Inflasi",
        value: loading
          ? "..."
          : inflasiBulanan != null
            ? `${inflasiBulanan}%`
            : "-",
        color: "blue",
      },
      {
        label: "Target TPID",
        shortLabel: "TPID",
        value: loading ? "..." : "< 2,50%",
        color: "indigo",
      },
      {
        label: "Stok CPPD (hari)",
        shortLabel: "CPPD",
        value: loading ? "..." : (summary?.cppd_status?.stok_hari ?? "-"),
        color: "emerald",
      },
      {
        label: "Rapat Mendagri",
        shortLabel: "Rapat",
        value: loading ? "..." : "H-3",
        color: "amber",
      },
      {
        label: "Tugas Aktif Tim",
        shortLabel: "Tim",
        value: loading ? "..." : (summary?.tugas_aktif_tim ?? "-"),
        color: "indigo",
      },
      {
        label: "Alert Harga",
        shortLabel: "Alert",
        value: loading ? "..." : (summary?.alert_harga_kritis?.jumlah ?? "-"),
        color: "red",
      },
    ];

    return renderTiles(tiles, COLOR_MAP);
  }

  const validCount = summary?.validitas_data?.valid;
  const totalCount = summary?.validitas_data?.total;
  const tiles = [
    {
      label: "Tugas Aktif Tim",
      shortLabel: "Tim",
      value: loading ? "..." : (summary?.tugas_aktif_tim ?? "-"),
      color: "indigo",
    },
    {
      label: "Laporan Pending",
      shortLabel: "Pending",
      value: loading ? "..." : (summary?.laporan_pending_review ?? "-"),
      color: "amber",
    },
    {
      label: "EWS Alert Aktif",
      shortLabel: "EWS",
      value: loading ? "..." : (summary?.ews_status?.alert_aktif ?? "-"),
      color: "red",
    },
    {
      label: "Neraca Pangan",
      shortLabel: "Neraca",
      value: loading ? "..." : (summary?.neraca_pangan?.label ?? "-"),
      color: "green",
    },
    {
      label: "Kab/Kota Rawan",
      shortLabel: "Rawan",
      value: loading ? "..." : (summary?.kabupaten_rawan ?? "-"),
      color: "orange",
    },
    {
      label: "Data Valid",
      shortLabel: "Valid",
      value: loading
        ? "..."
        : totalCount
          ? `${validCount}/${totalCount}`
          : "-",
      color: "blue",
    },
  ];

  return renderTiles(tiles, COLOR_MAP);
}
