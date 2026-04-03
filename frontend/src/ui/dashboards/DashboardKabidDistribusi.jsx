// frontend/src/ui/dashboards/DashboardKabidDistribusi.jsx
// P17: Dashboard Kepala Bidang Distribusi & Cadangan Pangan
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import { roleIdToName } from "../../utils/roleMap";
import { workflowStatusUpdateAPI } from "../../services/workflowStatusService";
import api from "../../services/api";
import HorizontalCoordinationRoleDashboard from "../../components/coordination/HorizontalCoordinationRoleDashboard.jsx";
import BukaEPelaraButton from "../../components/BukaEPelaraButton";
import HeroKpiTilesKabid from "../../components/kabidKetersediaan/HeroKpiTilesKabid";
import HeroInflasiPanel from "../../components/distribusi/HeroInflasiPanel";
import CppdStatusPanel from "../../components/distribusi/CppdStatusPanel";
import AlertHargaKritisPanel from "../../components/distribusi/AlertHargaKritisPanel";
import ApprovalQueueJF from "../../components/kabidKetersediaan/ApprovalQueueJF";
import TimSayaPanel from "../../components/kabidKetersediaan/TimSayaPanel";
import DikembalikanSekretarisPanel from "../../components/kabidKetersediaan/DikembalikanSekretarisPanel";
import CoordinationComposer from "../../components/coordination/CoordinationComposer";
import CoordinationInboxPanel from "../../components/coordination/CoordinationInboxPanel";
import CoordinationOutboxPanel from "../../components/coordination/CoordinationOutboxPanel";
import {
  COORDINATION_KIND_OPTIONS,
  SEKRETARIS_ONLY_TARGET_OPTION,
} from "../../components/coordination/coordinationOptions";
import KomunikasiPanel, {
  LANES as KOM_LANES,
} from "../../components/panel/KomunikasiPanel.jsx";
import ExecutionThreadObservabilityPanel from "../../components/execution/ExecutionThreadObservabilityPanel.jsx";

function normalizeRoleName(user) {
  return (
    (user?.roleName && String(user.roleName).toLowerCase()) ||
    user?.role ||
    roleIdToName?.[user?.role_id] ||
    roleIdToName?.[String(user?.role_id)] ||
    null
  );
}

function normalizeUnit(user) {
  return user?.unit_kerja ? String(user.unit_kerja).toLowerCase() : "";
}

const ALLOWED = [
  "kepala_bidang_distribusi",
  "kepala_bidang",
  "kabid_distribusi",
  "super_admin",
  "kepala_dinas",
];

const SIDEBAR_MENU = [
  { id: "overview", label: "Dashboard (Overview)", icon: "📊" },
  { id: "inbox", label: "Inbox Kepala Dinas", icon: "📥", badge: 1 },
  { id: "komunikasi", label: "Tanggapan & diskusi", icon: "💬" },
  { id: "approval", label: "Approval Queue (JF)", icon: "📤", badge: 3 },
  { id: "dikembalikan", label: "Dikembalikan Sekretaris", icon: "↩️", badge: 1 },
  { id: "tim", label: "Tim Saya (JF)", icon: "👥" },
  { id: "skp-jf", label: "Kinerja Tim (SKP JF)", icon: "📊" },
  { divider: true, label: "DATA TEKNIS BIDANG" },
  { id: "d1", label: "D1. Pemantauan Harga & Inflasi", icon: "📈" },
  { id: "d2", label: "D2. CPPD (Cadangan Pangan)", icon: "🏛️" },
  { id: "d3", label: "D3. Operasi Pasar", icon: "🛒" },
  { id: "d4", label: "D4. Koordinasi TPID", icon: "🤝" },
  { id: "d5", label: "D5. Program & Rencana Aksi", icon: "📋" },
  { id: "d6", label: "D6. Monev & SAKIP", icon: "📊" },
  { divider: true, label: "KOORDINASI & LAPORAN" },
  { id: "laporan-mendagri", label: "Laporan Rapat Mendagri", icon: "🏛️" },
  { id: "laporan-sekretaris", label: "Laporan ke Sekretaris", icon: "📤" },
  { id: "koordinasi", label: "Koordinasi TPID/BI/BULOG", icon: "🤝" },
  { id: "skp-saya", label: "SKP Saya (read)", icon: "📋" },
];

// ─── Inline: Operasi Pasar Table ───
function OperasiPasarPanel() {
  const MOCK_OPS = [
    { tanggal: "2026-03-28", lokasi: "Pasar Bahari Ternate", komoditas: "Beras Medium", volume_ton: 5, status: "Selesai" },
    { tanggal: "2026-03-25", lokasi: "Pasar Tobelo, Haltim", komoditas: "Minyak Goreng", volume_ton: 2, status: "Selesai" },
    { tanggal: "2026-04-02", lokasi: "Pasar Sofifi", komoditas: "Gula Pasir", volume_ton: 3, status: "Dijadwalkan" },
    { tanggal: "2026-04-05", lokasi: "Pasar Jailolo, Halbar", komoditas: "Beras Premium", volume_ton: 4, status: "Dijadwalkan" },
  ];
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">🛒 Operasi Pasar</h2>
      <p className="text-xs text-gray-500 mb-3">Agenda dan realisasi operasi pasar untuk stabilisasi harga komoditas pokok.</p>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-3 py-2 text-left">Tanggal</th>
              <th className="px-3 py-2 text-left">Lokasi</th>
              <th className="px-3 py-2 text-left">Komoditas</th>
              <th className="px-3 py-2 text-left">Volume (ton)</th>
              <th className="px-3 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_OPS.map((row, i) => (
              <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-2">{new Date(row.tanggal).toLocaleDateString("id-ID")}</td>
                <td className="px-3 py-2">{row.lokasi}</td>
                <td className="px-3 py-2 font-medium">{row.komoditas}</td>
                <td className="px-3 py-2">{row.volume_ton}</td>
                <td className="px-3 py-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    row.status === "Selesai" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                  }`}>{row.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Inline: TPID Koordinasi Panel ───
function TpidKoordinasiPanel() {
  const instansi = [
    { nama: "Bank Indonesia", peran: "Stabilisasi moneter & inflasi", kontak: "Perwakilan BI Malut" },
    { nama: "Disperindag Provinsi", peran: "Pemantauan harga & perdagangan", kontak: "Dinas Perindustrian" },
    { nama: "Bulog Subdivre Malut", peran: "Cadangan & distribusi beras", kontak: "Bulog Ternate" },
    { nama: "Dinas Pertanian", peran: "Data produksi & ketersediaan", kontak: "Dinas Pertanian Provmal" },
    { nama: "BPS Maluku Utara", peran: "Data inflasi & statistik", kontak: "BPS Malut" },
  ];
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h2 className="font-bold text-gray-800 mb-4">🤝 Koordinasi TPID — Tim Pengendalian Inflasi Daerah</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs font-semibold text-blue-700 mb-1">Rapat Terakhir</p>
          <p className="font-bold text-gray-800">15 Maret 2026</p>
          <p className="text-xs text-gray-500">Agenda: Review inflasi Februari & rencana OP</p>
        </div>
        <div className="p-3 bg-green-50 rounded-lg border border-green-100">
          <p className="text-xs font-semibold text-green-700 mb-1">Rapat Berikutnya</p>
          <p className="font-bold text-gray-800">5 April 2026</p>
          <p className="text-xs text-gray-500">Agenda: Koordinasi H-30 Ramadhan & Lebaran</p>
        </div>
      </div>
      <h3 className="font-semibold text-gray-700 text-sm mb-2">Anggota TPID</h3>
      <div className="space-y-2">
        {instansi.map((inst, i) => (
          <div key={i} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100">
            <div>
              <p className="font-medium text-sm text-gray-800">{inst.nama}</p>
              <p className="text-xs text-gray-500">{inst.peran}</p>
            </div>
            <span className="text-xs text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">{inst.kontak}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Inline: Laporan Mendagri ───
function LaporanMendagriPanel() {
  const [periode, setPeriode] = useState("Maret I 2026");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [err, setErr] = useState("");

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setErr("");
    setGenerated(false);
    try {
      await api.post("/kabid-distribusi/inflasi/generate-mendagri", { periode_label: periode });
      setGenerated(true);
    } catch {
      setErr("Gagal membuat laporan. Periksa sesi login atau coba lagi.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
        <p className="font-semibold text-red-700 text-sm mb-1">⚠️ KRITIS — Kewajiban Rapat Dua Mingguan</p>
        <p className="text-xs text-red-600">Setiap 2 minggu, wajib rapat Zoom dengan Mendagri (Kemendagri). Data inflasi dan harga komoditas harus siap sebelum rapat.</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-800 mb-4">🏛️ Generator Laporan Rapat Mendagri</h2>
        <form onSubmit={handleGenerate} className="space-y-3">
          <div>
            <label className="text-xs text-gray-600 block mb-1">Pilih Periode (2-Mingguan)</label>
            <select
              value={periode}
              onChange={(e) => { setPeriode(e.target.value); setGenerated(false); }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white"
            >
              {["Maret I 2026", "Maret II 2026", "April I 2026", "April II 2026", "Mei I 2026"].map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="font-semibold text-gray-700 mb-1">Data yang akan dimasukkan:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Inflasi Maluku Utara (MoM & YoY)</li>
                <li>Harga 9 komoditas pokok</li>
                <li>Status cadangan pangan (CPPD)</li>
                <li>Realisasi operasi pasar</li>
                <li>Rekomendasi tindak lanjut</li>
              </ul>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="font-semibold text-blue-700 mb-1">Format Output:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>PDF Laporan Kemendagri</li>
                <li>PowerPoint Presentasi</li>
                <li>Tabel Data Excel</li>
                <li>Ringkasan Eksekutif</li>
              </ul>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={generating}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition"
            >
              {generating ? "Membuat Laporan…" : "📄 Generate Laporan"}
            </button>
            {generated && (
              <span className="text-xs text-green-600 font-medium">✅ Laporan siap diunduh.</span>
            )}
            {err && <span className="text-xs text-red-600 font-medium">{err}</span>}
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DashboardKabidDistribusi() {
  const user = useAuthStore((state) => state.user);
  const roleName = normalizeRoleName(user);
  const unit = normalizeUnit(user);

  const [activeMenu, setActiveMenu] = useState("overview");
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAllowed =
    !!user &&
    (ALLOWED.includes(roleName) ||
      (unit.includes("distribusi") && (roleName?.includes("kepala_bidang") || roleName?.includes("kabid"))));

  useEffect(() => {
    if (user) {
      workflowStatusUpdateAPI({
        user,
        modulId: "KBD-001",
        status: "akses",
        detail: "Akses Dashboard Kepala Bidang Distribusi",
      });
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setSummaryLoading(true);
    api
      .get("/kabid-distribusi/dashboard/summary")
      .then((res) => setSummary(res.data?.data ?? null))
      .catch(() => setSummary(null))
      .finally(() => setSummaryLoading(false));
  }, [user]);

  if (!isAllowed) return <Navigate to="/" replace />;

  const renderContent = () => {
    switch (activeMenu) {
      case "overview":
        return (
          <div className="space-y-6">
            <HeroKpiTilesKabid variant="distribusi" summary={summary} loading={summaryLoading} />
            <HorizontalCoordinationRoleDashboard
              variant="kabid"
              title="Koordinasi horizontal & dependensi (Distribusi)"
            />
            <ExecutionThreadObservabilityPanel title="Thread eksekusi bidang distribusi" />
            <HeroInflasiPanel />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ApprovalQueueJF unitKerja="Bidang Distribusi" />
              <TimSayaPanel unitKerja="Bidang Distribusi" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AlertHargaKritisPanel />
              <CppdStatusPanel />
            </div>
            <DikembalikanSekretarisPanel unitKerja="Bidang Distribusi" />
          </div>
        );

      case "inbox":
        return (
          <CoordinationInboxPanel
            title="Inbox Sekretaris"
            subtitle="Perintah dan koordinasi yang masuk dari Sekretaris untuk Bidang Distribusi."
            sourceRole="sekretaris"
            emptyText="Belum ada arahan atau koordinasi dari Sekretaris."
            allowClose
          />
        );

      case "legacy_inbox":
        return (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              📥 Inbox dari Kepala Dinas
              <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700 font-bold">1</span>
            </h2>
            <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
              <p className="font-medium text-sm text-gray-800">Instruksi Percepatan Operasi Pasar — Ramadhan 2026</p>
              <p className="text-xs text-gray-500 mt-1">Dari: Kepala Dinas · 29 Maret 2026</p>
              <p className="text-xs text-gray-600 mt-2">Mohon segera koordinasikan dengan Bulog untuk operasi pasar di 5 kabupaten/kota sebelum H-14 Ramadhan.</p>
            </div>
          </div>
        );

      case "approval":
        return <ApprovalQueueJF unitKerja="Bidang Distribusi" />;

      case "komunikasi":
        return (
          <KomunikasiPanel
            lane={KOM_LANES.ES3_ES4}
            titleTanggapan="Tanggapan JF / Kasubag / Pelaksana"
            titleDiskusi="Diskusi dengan bawahan (task)"
          />
        );

      case "dikembalikan":
        return <DikembalikanSekretarisPanel unitKerja="Bidang Distribusi" />;

      case "tim":
        return <TimSayaPanel unitKerja="Bidang Distribusi" />;

      case "d1":
        return (
          <div className="space-y-6">
            <HeroInflasiPanel />
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-800 mb-4">📈 Harga Pasar Per Kabupaten/Kota</h2>
              <p className="text-xs text-gray-500 mb-3">Data harga harian komoditas pokok dari 10 kab/kota Maluku Utara.</p>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                    <tr>
                      <th className="px-3 py-2 text-left">Kab/Kota</th>
                      <th className="px-3 py-2 text-left">Beras (Rp/kg)</th>
                      <th className="px-3 py-2 text-left">Minyak (Rp/L)</th>
                      <th className="px-3 py-2 text-left">Gula (Rp/kg)</th>
                      <th className="px-3 py-2 text-left">Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { kab: "Ternate", beras: 15000, minyak: 18000, gula: 18000, update: "30 Mar" },
                      { kab: "Tidore Kepulauan", beras: 14800, minyak: 17500, gula: 17500, update: "29 Mar" },
                      { kab: "Halmahera Utara", beras: 15200, minyak: 19000, gula: 18200, update: "29 Mar" },
                      { kab: "Halmahera Selatan", beras: 15500, minyak: 18500, gula: 18500, update: "28 Mar" },
                      { kab: "Kepulauan Sula", beras: 16000, minyak: 19500, gula: 19000, update: "27 Mar" },
                    ].map((row, i) => (
                      <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium">{row.kab}</td>
                        <td className="px-3 py-2">{row.beras.toLocaleString("id-ID")}</td>
                        <td className="px-3 py-2">{row.minyak.toLocaleString("id-ID")}</td>
                        <td className="px-3 py-2">{row.gula.toLocaleString("id-ID")}</td>
                        <td className="px-3 py-2 text-gray-500 text-xs">{row.update}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <AlertHargaKritisPanel compact />
          </div>
        );

      case "d2":
        return (
          <div className="space-y-5">
            <CppdStatusPanel />
            <OperasiPasarPanel />
          </div>
        );

      case "d3":
        return <OperasiPasarPanel />;

      case "d4":
        return <TpidKoordinasiPanel />;

      case "d5":
        return (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-800 mb-4">📋 Program & Rencana Aksi — Bidang Distribusi</h2>
            <div className="space-y-3">
              {[
                { program: "Pemantauan Harga 9 Komoditas Pokok", target: "52 kali/tahun", realisasi: "18/52", pct: 35 },
                { program: "Operasi Pasar Murah", target: "24 kali/tahun", realisasi: "7/24", pct: 29 },
                { program: "Koordinasi TPID", target: "24 kali/tahun", realisasi: "6/24", pct: 25 },
                { program: "Penguatan CPPD", target: "4 kegiatan", realisasi: "1/4", pct: 25 },
                { program: "Laporan Mendagri (2-Mingguan)", target: "24 laporan", realisasi: "6/24", pct: 25 },
              ].map((p, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-sm text-gray-800">{p.program}</p>
                    <span className="text-xs text-gray-500">{p.realisasi} · {p.target}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${p.pct >= 50 ? "bg-green-500" : p.pct >= 25 ? "bg-blue-500" : "bg-amber-400"}`} style={{ width: `${p.pct}%` }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{p.pct}% tercapai</p>
                </div>
              ))}
            </div>
          </div>
        );

      case "d6":
        return (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-800 mb-4">📊 Monev & SAKIP — Bidang Distribusi</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
              {[
                { label: "Capaian IKU", value: "72%", color: "text-blue-600" },
                { label: "Realisasi Anggaran", value: "28%", color: "text-green-600" },
                { label: "Nilai SAKIP", value: "BB", color: "text-amber-600" },
                { label: "Risiko Aktif", value: "3", color: "text-red-600" },
              ].map((k, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-center">
                  <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{k.label}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400">Data SAKIP diperbarui per kuartal. Hubungi Sekretariat untuk detail laporan capaian.</p>
          </div>
        );

      case "laporan-mendagri":
        return <LaporanMendagriPanel />;

      case "laporan-sekretaris":
        return (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <CoordinationComposer
              title="Kirim Koordinasi ke Sekretaris"
              subtitle="Gunakan kanal ini untuk menyampaikan update TPID, operasi pasar, atau kebutuhan keputusan lintas unit."
              targetOptions={SEKRETARIS_ONLY_TARGET_OPTION}
              kindOptions={COORDINATION_KIND_OPTIONS}
              defaultTargetRole="sekretaris"
              defaultKind="koordinasi"
              submitLabel="Kirim Koordinasi"
            />
            <CoordinationOutboxPanel
              title="Outbox Koordinasi Sekretaris"
              subtitle="Pantau status koordinasi Bidang Distribusi yang sudah dikirim ke Sekretaris."
              targetRole="sekretaris"
              kind="koordinasi"
              emptyText="Belum ada koordinasi yang dikirim ke Sekretaris."
            />
          </div>
        );

      case "legacy_laporan_sekretaris":
        return (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-800 mb-4">📤 Laporan ke Sekretaris Dinas</h2>
            <p className="text-sm text-gray-500 mb-4">Kirim laporan perkembangan kegiatan Bidang Distribusi kepada Sekretaris untuk diteruskan ke Kepala Dinas.</p>
            <div className="flex flex-wrap gap-3">
              {["Laporan Mingguan", "Laporan Bulanan", "Laporan TPID", "Laporan Operasi Pasar"].map(l => (
                <button key={l} className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium rounded-lg border border-blue-200 transition">
                  📤 {l}
                </button>
              ))}
            </div>
          </div>
        );

      case "koordinasi":
        return <TpidKoordinasiPanel />;

      case "skp-jf":
        return (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-800 mb-4">📊 Penilaian Kinerja JF (SKP)</h2>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
              <p className="font-semibold mb-1">⚠️ Pembatasan Akses PP 30/2019</p>
              <p>Kepala Bidang hanya dapat menilai JF 1 dan JF 2 (bawahan langsung).</p>
              <p className="mt-1 text-red-600 font-medium">❌ Nilai SKP Pelaksana di bawah JF DIBLOKIR TOTAL — Anda tidak dapat mengaksesnya.</p>
            </div>
          </div>
        );

      case "skp-saya":
        return (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-800 mb-3">📋 SKP Saya</h2>
            <p className="text-sm text-gray-500">SKP Kepala Bidang Distribusi (read-only). Penilaian dilakukan oleh Kepala Dinas.</p>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700">
              Lihat detail SKP di modul e-Pelara — SKP.
            </div>
            <div className="mt-3">
              <BukaEPelaraButton label="Buka SKP di e-Pelara →" targetPath="/" className="!py-1.5 !px-3 !text-xs" />
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
            <p className="text-gray-400 text-sm">Modul ini sedang dalam pengembangan.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-72 bg-slate-900 flex flex-col transition-transform duration-200`}>
        <div className="p-5 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏛️</span>
            <div>
              <p className="font-bold text-white text-sm">SIGAP-MALUT</p>
              <p className="text-xs text-slate-400">Kepala Bidang Distribusi</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {SIDEBAR_MENU.map((item, i) => {
            if (item.divider) {
              return (
                <div key={i} className="px-3 pt-3 pb-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{item.label}</p>
                </div>
              );
            }
            return (
              <button
                key={item.id}
                onClick={() => { setActiveMenu(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition ${activeMenu === item.id ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-700 hover:text-white"}`}
              >
                <span className="flex items-center gap-2">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </span>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded-full text-xs bg-amber-500 text-white font-bold min-w-[18px] text-center">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-700">
          <BukaEPelaraButton label="e-Pelara" targetPath="/" className="w-full !py-2 !text-xs" />
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-900/95 to-slate-900/80 border-b border-blue-700/50 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-white p-1 rounded hover:bg-white/10"
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>
            <div>
              <h1 className="font-bold text-white text-lg">Kepala Bidang Distribusi & Cadangan Pangan</h1>
              <p className="text-blue-200/70 text-xs">
                {user?.nama_lengkap || user?.name || "—"} · {new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-2 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-amber-200 text-xs font-medium">
              🔔 {(summary?.laporan_pending ?? 0) + 1} notif
            </span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
