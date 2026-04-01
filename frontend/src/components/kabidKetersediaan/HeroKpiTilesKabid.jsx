// Hero KPI Tiles — 6 tiles untuk Kepala Bidang
import React from "react";

export default function HeroKpiTilesKabid({ summary, loading, variant = "ketersediaan" }) {
  if (variant === "konsumsi") {
    const tiles = [
      {
        label: "SPPG Realisasi",
        value: loading
          ? "…"
          : summary?.sppg_realisasi_persen != null
            ? `${summary.sppg_realisasi_persen}%`
            : "—",
        color: "emerald",
        icon: "🍽️",
      },
      {
        label: "PPH Skor",
        value: loading
          ? "…"
          : summary?.pph_skor != null
            ? `${summary.pph_skor}`
            : summary?.skor_pph_capaian?.nilai != null
              ? `${summary.skor_pph_capaian.nilai}`
              : "—",
        color: "blue",
        icon: "📊",
      },
      {
        label: "Keracunan Aktif",
        value: loading ? "…" : (summary?.keracunan_aktif ?? "—"),
        color: "red",
        icon: "🚨",
      },
      {
        label: "Inspeksi Bulan Ini",
        value: loading ? "…" : (summary?.inspeksi_bulan_ini ?? "—"),
        color: "amber",
        icon: "🔍",
      },
      {
        label: "Deadline Bapanas",
        value: loading
          ? "…"
          : summary?.deadline_bapanas_hari != null
            ? `H−${summary.deadline_bapanas_hari}`
            : "—",
        color: "indigo",
        icon: "⏰",
      },
      {
        label: "Tugas Tim",
        value: loading ? "…" : (summary?.tugas_aktif_tim ?? "—"),
        color: "indigo",
        icon: "👥",
      },
    ];
    const colorMap = {
      indigo: "bg-indigo-50 border-indigo-200 text-indigo-700",
      amber: "bg-amber-50 border-amber-200 text-amber-700",
      red: "bg-red-50 border-red-200 text-red-700",
      green: "bg-emerald-50 border-emerald-200 text-emerald-700",
      orange: "bg-orange-50 border-orange-200 text-orange-700",
      blue: "bg-blue-50 border-blue-200 text-blue-700",
      emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    };
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {tiles.map((tile) => (
          <div
            key={tile.label}
            className={`rounded-xl border p-4 flex flex-col gap-1 ${colorMap[tile.color]}`}
          >
            <div className="text-xl mb-1">{tile.icon}</div>
            <div className="text-2xl font-bold">{tile.value}</div>
            <div className="text-xs font-medium opacity-80">{tile.label}</div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "distribusi") {
    const ib = summary?.inflasi_bulanan;
    const ibVal =
      ib && typeof ib === "object" && ib.nilai != null
        ? `${ib.nilai}%`
        : ib != null
          ? `${ib}%`
          : "—";
    const distTiles = [
      {
        label: "Inflasi Bulanan",
        value: loading ? "…" : ibVal,
        color: "blue",
        icon: "📈",
      },
      {
        label: "Target TPID",
        value: loading ? "…" : "< 2,50%",
        color: "indigo",
        icon: "🎯",
      },
      {
        label: "Stok CPPD (hari)",
        value: loading ? "…" : (summary?.cppd_status?.stok_hari ?? "—"),
        color: "emerald",
        icon: "🏭",
      },
      {
        label: "Rapat Mendagri",
        value: loading ? "…" : "H−3",
        color: "amber",
        icon: "🏛️",
      },
      {
        label: "Tugas Aktif Tim",
        value: loading ? "…" : (summary?.tugas_aktif_tim ?? "—"),
        color: "indigo",
        icon: "👥",
      },
      {
        label: "Alert Harga",
        value: loading ? "…" : (summary?.alert_harga_kritis?.jumlah ?? "—"),
        color: "red",
        icon: "🚨",
      },
    ];
    const colorMap = {
      indigo: "bg-indigo-50 border-indigo-200 text-indigo-700",
      amber: "bg-amber-50 border-amber-200 text-amber-700",
      red: "bg-red-50 border-red-200 text-red-700",
      green: "bg-emerald-50 border-emerald-200 text-emerald-700",
      orange: "bg-orange-50 border-orange-200 text-orange-700",
      blue: "bg-blue-50 border-blue-200 text-blue-700",
      emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    };
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {distTiles.map((tile) => (
          <div
            key={tile.label}
            className={`rounded-xl border p-4 flex flex-col gap-1 ${colorMap[tile.color]}`}
          >
            <div className="text-xl mb-1">{tile.icon}</div>
            <div className="text-2xl font-bold">{tile.value}</div>
            <div className="text-xs font-medium opacity-80">{tile.label}</div>
          </div>
        ))}
      </div>
    );
  }

  const tiles = [
    {
      label: "Tugas Aktif Tim",
      value: loading ? "…" : (summary?.tugas_aktif_tim ?? "—"),
      color: "indigo",
      icon: "📋",
    },
    {
      label: "Laporan Pending",
      value: loading ? "…" : (summary?.laporan_pending_review ?? "—"),
      color: "amber",
      icon: "📤",
    },
    {
      label: "EWS Alert Aktif",
      value: loading ? "…" : (summary?.ews_status?.alert_aktif ?? "—"),
      color: "red",
      icon: "🚨",
    },
    {
      label: "Neraca Pangan",
      value: loading ? "…" : (summary?.neraca_pangan?.status ?? "—"),
      color: "green",
      icon: "⚖️",
    },
    {
      label: "Kab. Rawan",
      value: loading ? "…" : (summary?.kabupaten_rawan ?? "—"),
      color: "orange",
      icon: "🗺️",
    },
    {
      label: "Realisasi Anggaran",
      value: loading ? "…" : (summary?.realisasi_anggaran_persen ? `${summary.realisasi_anggaran_persen}%` : "—"),
      color: "blue",
      icon: "💰",
    },
  ];

  const colorMap = {
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
    red: "bg-red-50 border-red-200 text-red-700",
    green: "bg-emerald-50 border-emerald-200 text-emerald-700",
    orange: "bg-orange-50 border-orange-200 text-orange-700",
    blue: "bg-blue-50 border-blue-200 text-blue-700",
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className={`rounded-xl border p-4 flex flex-col gap-1 ${colorMap[tile.color]}`}
        >
          <div className="text-xl mb-1">{tile.icon}</div>
          <div className="text-2xl font-bold">{tile.value}</div>
          <div className="text-xs font-medium opacity-80">{tile.label}</div>
        </div>
      ))}
    </div>
  );
}
