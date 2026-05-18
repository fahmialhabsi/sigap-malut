// frontend/src/ui/dashboards/DashboardPelaksana.jsx
// A-10: Dashboard Staf Pelaksana
// config/roles.json: staf_pelaksana → create_draft, update_task_progress, upload_evidence, submit_done, view_assigned
// e-Pelara role (D-10): pelaksana → DRAFTER (create & update draft dokumen)
// P13 + P16: Pelaksana — modul data lapangan adaptif per unit_kerja
import React, { useEffect, useMemo, useState } from "react";
import SubmitHasilModal from "../../components/pelaksana/SubmitHasilModal";
import AbsensiHarianPanel from "../../components/pelaksana/AbsensiHarianPanel";
import ModulFormPanel from "../../components/ModulFormPanel";
import SpjPelaksanaPanel from "../../components/spj/SpjPelaksanaPanel";
import FormInputHargaPasar from "../../components/pelaksana/FormInputHargaPasar";
import FormInputDataKonsumsi from "../../components/pelaksana/FormInputDataKonsumsi";
import FormInputAdminTU from "../../components/pelaksana/FormInputAdminTU";
import FormInputSertifikasiUptd from "../../components/pelaksana/FormInputSertifikasiUptd";
import FormInputUjiLabUptd from "../../components/pelaksana/FormInputUjiLabUptd";
import ProgressCoverageHariIniStrip from "../../components/pelaksana/ProgressCoverageHariIniStrip";
import { Navigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import { roleIdToName } from "../../utils/roleMap";
import { workflowStatusUpdateAPI } from "../../services/workflowStatusService";
import BukaEPelaraButton from "../../components/BukaEPelaraButton";
import DashboardNotificationStrip from "../../components/notifications/DashboardNotificationStrip";
import UploadSuratMasukQuickAction from "../../components/surat/UploadSuratMasukQuickAction";
import KomunikasiPanel, {
  LANES as KOM_LANES,
} from "../../components/panel/KomunikasiPanel.jsx";
import api from "../../services/api";

// ─── Inline component: Modul Input Data Pangan (Pelaksana Bidang Teknis) ───
function ModulInputDataPanganKetersediaan({ unitKerja }) {
  const [tab, setTab] = useState("produksi"); // produksi|stok|kerawanan
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    // produksi
    periode_bulan: new Date().getMonth() + 1,
    periode_tahun: new Date().getFullYear(),
    kabupaten_kota: "",
    komoditas_id: "",
    volume_produksi: "",
    satuan: "ton",
    sumber_data: "survei_lapangan",
    catatan: "",
    // stok
    tanggal_update: today,
    lokasi_gudang: "",
    volume_stok: "",
    estimasi_hari: "",
    // kerawanan
    periode: new Date().toISOString().slice(0, 7),
    kecamatan: "",
    skor_kerawanan: "",
    status_kerawanan: "waspada",
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    setHistoryLoading(true);
    api
      .get("/api/pelaksana/data-pangan/riwayat", { params: { limit: 5 } })
      .then((res) => setHistory(Array.isArray(res.data?.data) ? res.data.data : []))
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    try {
      const payload =
        tab === "produksi"
          ? {
              tipe: "produksi",
              periode_bulan: form.periode_bulan,
              periode_tahun: form.periode_tahun,
              kabupaten_kota: form.kabupaten_kota,
              komoditas_id: form.komoditas_id,
              volume_produksi: form.volume_produksi,
              satuan: form.satuan,
              sumber_data: form.sumber_data,
              catatan: form.catatan,
            }
          : tab === "stok"
            ? {
                tipe: "stok",
                tanggal_update: form.tanggal_update,
                lokasi_gudang: form.lokasi_gudang,
                kabupaten_kota: form.kabupaten_kota,
                komoditas_id: form.komoditas_id,
                volume_stok: form.volume_stok,
                satuan: form.satuan,
                estimasi_hari: form.estimasi_hari,
              }
            : {
                tipe: "kerawanan",
                periode: form.periode,
                kabupaten_kota: form.kabupaten_kota,
                kecamatan: form.kecamatan,
                skor_kerawanan: form.skor_kerawanan,
                status_kerawanan: form.status_kerawanan,
                catatan: form.catatan,
              };

      const res = await api.post("/api/pelaksana/data-pangan", payload);
      setResult({ ok: true });
      setHistory((prev) => [res.data?.data ?? { ...form, id: Date.now() }, ...prev.slice(0, 4)]);
      setForm((f) => ({
        ...f,
        kabupaten_kota: "",
        komoditas_id: "",
        volume_produksi: "",
        volume_stok: "",
        lokasi_gudang: "",
        kecamatan: "",
        skor_kerawanan: "",
        catatan: "",
      }));
    } catch {
      setResult({ ok: false });
    } finally {
      setSubmitting(false);
    }
  };

  const KOMODITAS_ID_LIST = [
    { id: 1, label: "Beras" },
    { id: 2, label: "Jagung" },
    { id: 3, label: "Sagu" },
    { id: 4, label: "Ikan" },
    { id: 5, label: "Ubi Kayu" },
  ];

  return (
    <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-gray-800 flex items-center gap-2">
          🌾 Input Data Pangan Teknis
        </h2>
        <span className="text-xs bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 rounded-full font-medium">
          {unitKerja || "Bidang Teknis"}
        </span>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        Submit Anda akan otomatis masuk ke antrian verifikasi JF (wajib). Pelaksana tidak bisa bypass ke Kabid/Sekretaris/KaDin.
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { id: "produksi", label: "P-K1 Produksi" },
          { id: "stok", label: "P-K2 Stok Gudang" },
          { id: "kerawanan", label: "P-K3 Kerawanan" },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              tab === t.id
                ? "bg-blue-600 border-blue-600 text-white"
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {tab === "produksi" && (
            <>
              <div>
                <label className="text-xs text-gray-600 block mb-1">
                  Periode Bulan <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  required
                  value={form.periode_bulan}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, periode_bulan: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">
                  Periode Tahun <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={form.periode_tahun}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, periode_tahun: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </>
          )}
          {tab === "stok" && (
            <div>
              <label className="text-xs text-gray-600 block mb-1">
                Tanggal Update <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                required
                value={form.tanggal_update}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tanggal_update: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          )}
          <div>
            <label className="text-xs text-gray-600 block mb-1">
              Kabupaten/Kota <span className="text-red-400">*</span>
            </label>
            <input
              required
              value={form.kabupaten_kota}
              onChange={(e) =>
                setForm((f) => ({ ...f, kabupaten_kota: e.target.value }))
              }
              placeholder="Ternate, Halmahera Tengah…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1">
              Komoditas <span className="text-red-400">*</span>
            </label>
            <select
              required
              value={form.komoditas_id}
              onChange={(e) =>
                setForm((f) => ({ ...f, komoditas_id: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white"
            >
              <option value="">Pilih…</option>
              {KOMODITAS_ID_LIST.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1">
              {tab === "produksi"
                ? "Volume Produksi"
                : tab === "stok"
                  ? "Volume Stok"
                  : "Skor Kerawanan"}
              <span className="text-red-400">
                {tab === "kerawanan" ? "" : " *"}
              </span>
            </label>
            <input
              type="number"
              required={tab !== "kerawanan"}
              min={0}
              value={
                tab === "produksi"
                  ? form.volume_produksi
                  : tab === "stok"
                    ? form.volume_stok
                    : form.skor_kerawanan
              }
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  volume_produksi:
                    tab === "produksi" ? e.target.value : f.volume_produksi,
                  volume_stok:
                    tab === "stok" ? e.target.value : f.volume_stok,
                  skor_kerawanan:
                    tab === "kerawanan" ? e.target.value : f.skor_kerawanan,
                }))
              }
              placeholder="0"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>
          {tab === "stok" && (
            <div>
              <label className="text-xs text-gray-600 block mb-1">
                Lokasi Gudang <span className="text-red-400">*</span>
              </label>
              <input
                required
                value={form.lokasi_gudang}
                onChange={(e) =>
                  setForm((f) => ({ ...f, lokasi_gudang: e.target.value }))
                }
                placeholder="CPPD Ternate…"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          )}
          {tab === "kerawanan" && (
            <>
              <div>
                <label className="text-xs text-gray-600 block mb-1">
                  Periode (YYYY-MM) <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  value={form.periode}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, periode: e.target.value }))
                  }
                  placeholder="2026-03"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">
                  Kecamatan
                </label>
                <input
                  value={form.kecamatan}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, kecamatan: e.target.value }))
                  }
                  placeholder="Opsional…"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">
                  Status Kerawanan <span className="text-red-400">*</span>
                </label>
                <select
                  required
                  value={form.status_kerawanan}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, status_kerawanan: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                >
                  {["aman", "waspada", "rawan", "sangat_rawan"].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
          <div className="md:col-span-3">
            <label className="text-xs text-gray-600 block mb-1">Catatan</label>
            <input
              value={form.catatan}
              onChange={(e) =>
                setForm((f) => ({ ...f, catatan: e.target.value }))
              }
              placeholder="Catatan teknis / sumber data / temuan lapangan…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={
              submitting ||
              !form.kabupaten_kota ||
              !form.komoditas_id ||
              (tab === "produksi" && !form.volume_produksi) ||
              (tab === "stok" && (!form.volume_stok || !form.lokasi_gudang)) ||
              (tab === "kerawanan" && !form.status_kerawanan)
            }
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition"
          >
            {submitting ? "Mengirim…" : "📤 Submit ke JF untuk Verifikasi"}
          </button>
          {result && (
            <span className={`text-xs ${result.ok ? "text-green-600" : "text-red-500"}`}>
              {result.ok ? "✅ Berhasil. Masuk antrian verifikasi JF." : "❌ Gagal. Coba lagi."}
            </span>
          )}
        </div>
      </form>
      {/* Riwayat input */}
      {(historyLoading || history.length > 0) && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-500 mb-2">Riwayat Input Terbaru</p>
          {historyLoading ? (
            <p className="text-xs text-gray-400 animate-pulse">Memuat riwayat…</p>
          ) : (
            <div className="space-y-1.5">
              {history.map((item, i) => (
                <div key={item.id ?? i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-xs">
                  <span className="text-gray-700 font-medium">{item.tipe ?? "—"}</span>
                  <span className="text-gray-500">
                    {item.tanggal ? new Date(item.tanggal).toLocaleDateString("id-ID") : "—"}
                  </span>
                  <span className="text-blue-600 font-medium">{item.ringkas ?? "—"}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function rupiah(n) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));
}

function Badge({ n, tone = "default" }) {
  if (!n) return null;
  const cls =
    tone === "danger"
      ? "bg-red-100 text-red-700 border-red-200"
      : tone === "warn"
        ? "bg-amber-100 text-amber-700 border-amber-200"
        : "bg-slate-100 text-slate-700 border-slate-200";
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full border font-bold ${cls}`}>
      {n}
    </span>
  );
}

function normalizeRoleName(user) {
  const v =
    (user?.roleName && String(user.roleName)) ||
    (user?.role && String(user.role)) ||
    roleIdToName?.[user?.role_id] ||
    roleIdToName?.[String(user?.role_id)] ||
    null;
  return v ? String(v).trim().toLowerCase().replace(/[\s-]+/g, "_") : null;
}

const ALLOWED = [
  "pelaksana",
  "staf_pelaksana",
  "pelaksana_ketersediaan",
  "pelaksana_distribusi",
  "pelaksana_konsumsi",
  "super_admin",
  "kepala_dinas",
];

const PROGRESS_COLOR = {
  pending: "bg-gray-200",
  in_progress: "bg-blue-500",
  done: "bg-emerald-500",
  terlambat: "bg-red-500",
};

export default function DashboardPelaksana() {
  const user = useAuthStore((state) => state.user);
  const roleName = normalizeRoleName(user);
  const unitKerja = user?.unit_kerja ? String(user.unit_kerja).toLowerCase() : "";
  // unitKerjaNorm: normalisasi tanda hubung/spasi → underscore untuk deteksi konsisten
  // Contoh: "UPTD-Teknis" → "uptd-teknis" → "uptd_teknis"
  const unitKerjaNorm = unitKerja.replace(/[-\s]+/g, "_");
  const isSekretariat = unitKerja === "sekretariat" || unitKerja.includes("sekretariat");
  const isDistribusi = unitKerja.includes("distribusi");
  const isKetersediaan = unitKerja.includes("ketersediaan");
  const isKonsumsi = unitKerja.includes("konsumsi");
  // UPTD — mendukung format hyphen (UPTD-TU) maupun underscore (uptd_tu)
  const isUptdTu = unitKerjaNorm.includes("uptd_tu") || unitKerja.includes("tata_usaha") || unitKerja.includes("tata-usaha");
  const isUptdMutu = unitKerjaNorm.includes("uptd_mutu") || (unitKerja.includes("uptd") && unitKerja.includes("mutu"));
  const isUptdTeknis = unitKerjaNorm.includes("uptd_teknis") || (unitKerja.includes("uptd") && unitKerja.includes("teknis"));
  // Fallback umum: unit apapun yang mengandung "uptd" atau "balai"
  const isUptd = isUptdTu || isUptdMutu || isUptdTeknis || unitKerja.includes("uptd") || unitKerja.includes("balai");
  /** Tema visual khusus Pelaksana UPTD: nyaman dipandang lama, layar lebar */
  const themeUptdPl = isUptd;
  // Modul Data Pangan tersedia untuk semua Pelaksana KECUALI sekretariat
  const showDataPangan = unitKerja !== "sekretariat" && !unitKerja.includes("sekretariat");

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [absen, setAbsen] = useState(null); // { status, at }
  const [spjRows, setSpjRows] = useState([]);
  const [spjLoading, setSpjLoading] = useState(true);
  const [spjReturned, setSpjReturned] = useState([]);
  const [spjReturnedLoading, setSpjReturnedLoading] = useState(true);
  const [spjForm, setSpjForm] = useState({
    jenis_belanja: "perjalanan_dinas",
    sub_kegiatan_kode: "SEKRETARIAT",
    kode_rekening: "5.2.2.11.01",
    nominal: "",
    keterangan: "",
    tanggal_kegiatan: new Date().toISOString().slice(0, 10),
    lampiran_url: "",
  });
  const [spjSubmitting, setSpjSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      workflowStatusUpdateAPI({
        user,
        modulId: "PLK-001",
        status: "akses",
        detail: "Akses dashboard Pelaksana",
      });
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const url = isSekretariat ? "/api/pelaksana/tugas" : "/tasks/assigned";
    api
      .get(url, { params: { limit: 15 } })
      .then((res) =>
        setTasks(
          Array.isArray(res.data?.data)
            ? res.data.data
            : Array.isArray(res.data)
              ? res.data
              : [],
        ),
      )
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, [user, isSekretariat]);

  useEffect(() => {
    if (!user || !isSekretariat) return;
    api
      .get("/api/pelaksana/absensi/hari-ini")
      .then((res) => setAbsen(res.data?.data || null))
      .catch(() => setAbsen(null));
  }, [user, isSekretariat]);

  useEffect(() => {
    if (!user || !isSekretariat) return;
    setSpjLoading(true);
    api
      .get("/api/pelaksana/spj", { params: { limit: 10 } })
      .then((res) => setSpjRows(Array.isArray(res.data?.data) ? res.data.data : []))
      .catch(() => setSpjRows([]))
      .finally(() => setSpjLoading(false));
  }, [user, isSekretariat]);

  useEffect(() => {
    if (!user || !isSekretariat) return;
    setSpjReturnedLoading(true);
    api
      .get("/api/pelaksana/spj/dikembalikan", { params: { limit: 10 } })
      .then((res) =>
        setSpjReturned(Array.isArray(res.data?.data) ? res.data.data : []),
      )
      .catch(() => setSpjReturned([]))
      .finally(() => setSpjReturnedLoading(false));
  }, [user, isSekretariat]);

  const isAllowed = !!user && ALLOWED.includes(roleName);
  if (!isAllowed) return <Navigate to="/" replace />;

  const done = tasks.filter((t) => t.status === "done").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const pending = tasks.filter(
    (t) => !t.status || t.status === "pending",
  ).length;

  const overdue = tasks.filter((t) => {
    const due = t.due_date || t.deadline || t.dueDate || t.due;
    if (!due) return false;
    const d = new Date(due);
    return Number.isFinite(d.getTime()) && d.getTime() < Date.now() && t.status !== "done";
  }).length;

  const returned = tasks.filter((t) =>
    String(t.status || "").toLowerCase().includes("returned"),
  ).length;

  const kpiMini = [
    { label: "Tugas Aktif", value: loading ? "…" : inProgress + pending, color: "blue" },
    { label: "Tugas Overdue", value: loading ? "…" : overdue, color: overdue > 0 ? "red" : "amber" },
    { label: "Dikembalikan", value: loading ? "…" : returned, color: returned > 0 ? "red" : "gray" },
    { label: "Selesai", value: loading ? "…" : done, color: "emerald" },
  ];

  const menuKetersediaan = [
    { id: "overview", label: "Dashboard (Overview)", icon: "📊" },
    { id: "tasks", label: "Tugas Saya", icon: "📋", badge: loading ? null : tasks.length },
    { id: "komunikasi", label: "Tanggapan & diskusi", icon: "💬" },
    { id: "data-pangan", label: "Data Pangan (Submit ke JF)", icon: "🌾" },
    { id: "dikembalikan", label: "Dikembalikan JF", icon: "↩️", badge: loading ? null : returned },
    { divider: true, label: "KEUANGAN" },
    { id: "spj", label: "SPJ Saya", icon: "📁" },
    { divider: true, label: "PRIBADI" },
    { id: "absensi", label: "Absensi Saya", icon: "📅" },
    { id: "kinerja", label: "Nilai Kinerja Saya (read)", icon: "📊" },
    { divider: true, label: "LAINNYA" },
    { id: "pengaturan", label: "Profil & Pengaturan", icon: "⚙️" },
  ];

  const menuSekretariat = [
    { id: "tasks", label: "Tugas Saya", icon: "📋", badge: loading ? null : tasks.length },
    { id: "komunikasi", label: "Tanggapan & diskusi", icon: "💬" },
    { id: "buat-spj", label: "Buat SPJ", icon: "➕" },
    { id: "spj", label: "SPJ Saya", icon: "📁" },
    { id: "surat", label: "Surat Saya", icon: "📬" },
    { id: "sppd", label: "Perjalanan Dinas Saya", icon: "✈️" },
    { divider: true, label: "PRIBADI" },
    { id: "kinerja", label: "Nilai Kinerja Saya (read)", icon: "📊" },
    { id: "absensi", label: "Absensi Saya", icon: "📅" },
    { id: "slip-gaji", label: "Slip Gaji Saya (read)", icon: "💰" },
    { divider: true, label: "LAINNYA" },
    { id: "lapor-aset", label: "Laporkan Aset Rusak", icon: "🔧" },
    { id: "pengaturan", label: "Profil & Pengaturan", icon: "⚙️" },
  ];

  const menuDistribusi = [
    { id: "overview", label: "Dashboard (Overview)", icon: "📊" },
    { id: "tasks", label: "Tugas Saya", icon: "📋", badge: loading ? null : tasks.length },
    { id: "komunikasi", label: "Tanggapan & diskusi", icon: "💬" },
    { id: "harga-pasar", label: "Input Harga Pasar (Submit ke JF)", icon: "🛒" },
    { id: "dikembalikan", label: "Dikembalikan JF", icon: "↩️", badge: loading ? null : returned },
    { divider: true, label: "KEUANGAN" },
    { id: "spj", label: "SPJ Saya", icon: "📁" },
    { divider: true, label: "PRIBADI" },
    { id: "absensi", label: "Absensi Saya", icon: "📅" },
    { id: "kinerja", label: "Nilai Kinerja Saya (read)", icon: "📊" },
    { divider: true, label: "LAINNYA" },
    { id: "pengaturan", label: "Profil & Pengaturan", icon: "⚙️" },
  ];

  const menuKonsumsi = [
    { id: "overview", label: "Dashboard (Overview)", icon: "📊" },
    { id: "tasks", label: "Tugas Saya", icon: "📋", badge: loading ? null : tasks.length },
    { id: "komunikasi", label: "Tanggapan & diskusi", icon: "💬" },
    { id: "data-konsumsi", label: "Input Data Konsumsi (Submit ke JF)", icon: "🍽️" },
    { id: "dikembalikan", label: "Dikembalikan JF", icon: "↩️", badge: loading ? null : returned },
    { divider: true, label: "KEUANGAN" },
    { id: "spj", label: "SPJ Saya", icon: "📁" },
    { divider: true, label: "PRIBADI" },
    { id: "absensi", label: "Absensi Saya", icon: "📅" },
    { id: "kinerja", label: "Nilai Kinerja Saya (read)", icon: "📊" },
    { divider: true, label: "LAINNYA" },
    { id: "pengaturan", label: "Profil & Pengaturan", icon: "⚙️" },
  ];

  const menuUptdTu = [
    { id: "overview", label: "Dashboard (Overview)", icon: "📊" },
    { id: "tasks", label: "Tugas Saya", icon: "📋", badge: loading ? null : tasks.length },
    { id: "komunikasi", label: "Tanggapan & diskusi", icon: "💬" },
    { id: "uptd-admin-tu", label: "Admin TU (Submit ke Kasubag)", icon: "🗂️" },
    { id: "dikembalikan", label: "Dikembalikan", icon: "↩️", badge: loading ? null : returned },
    { divider: true, label: "KEUANGAN" },
    { id: "spj", label: "SPJ Saya", icon: "📁" },
    { divider: true, label: "PRIBADI" },
    { id: "absensi", label: "Absensi Saya", icon: "📅" },
    { id: "kinerja", label: "Nilai Kinerja Saya (read)", icon: "📊" },
    { divider: true, label: "LAINNYA" },
    { id: "pengaturan", label: "Profil & Pengaturan", icon: "⚙️" },
  ];

  const menuUptdMutu = [
    { id: "overview", label: "Dashboard (Overview)", icon: "📊" },
    { id: "tasks", label: "Tugas Saya", icon: "📋", badge: loading ? null : tasks.length },
    { id: "komunikasi", label: "Tanggapan & diskusi", icon: "💬" },
    { id: "uptd-sertifikasi", label: "Sertifikasi (Submit ke Kasi Mutu)", icon: "🏆" },
    { id: "dikembalikan", label: "Dikembalikan", icon: "↩️", badge: loading ? null : returned },
    { divider: true, label: "KEUANGAN" },
    { id: "spj", label: "SPJ Saya", icon: "📁" },
    { divider: true, label: "PRIBADI" },
    { id: "absensi", label: "Absensi Saya", icon: "📅" },
    { id: "kinerja", label: "Nilai Kinerja Saya (read)", icon: "📊" },
    { divider: true, label: "LAINNYA" },
    { id: "pengaturan", label: "Profil & Pengaturan", icon: "⚙️" },
  ];

  const menuUptdTeknis = [
    { id: "overview", label: "Dashboard (Overview)", icon: "📊" },
    { id: "tasks", label: "Tugas Saya", icon: "📋", badge: loading ? null : tasks.length },
    { id: "komunikasi", label: "Tanggapan & diskusi", icon: "💬" },
    { id: "uptd-uji-lab", label: "Hasil Uji Lab (Submit ke Kasi Teknis)", icon: "🧪" },
    { id: "dikembalikan", label: "Dikembalikan", icon: "↩️", badge: loading ? null : returned },
    { divider: true, label: "KEUANGAN" },
    { id: "spj", label: "SPJ Saya", icon: "📁" },
    { divider: true, label: "PRIBADI" },
    { id: "absensi", label: "Absensi Saya", icon: "📅" },
    { id: "kinerja", label: "Nilai Kinerja Saya (read)", icon: "📊" },
    { divider: true, label: "LAINNYA" },
    { id: "pengaturan", label: "Profil & Pengaturan", icon: "⚙️" },
  ];

  function AbsensiStrip() {
    const dayStr = new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-gray-800">📅 {dayStr}</div>
            <div className="text-xs text-gray-500 mt-0.5">
              Status Absensi Hari Ini:{" "}
              {absen ? (
                <span className="font-semibold text-emerald-700">
                  ✅ {absen.status.toUpperCase()} ({absen.at})
                </span>
              ) : (
                <span className="font-semibold text-red-600">❌ BELUM DIISI</span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "hadir", label: "✅ Saya Hadir" },
              { id: "sakit", label: "🤒 Sakit" },
              { id: "ijin", label: "📝 Ijin" },
              { id: "dinas_luar", label: "✈️ Dinas Luar" },
            ].map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={async () => {
                  const at = new Date().toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  if (isSekretariat) {
                    await api
                      .post("/api/pelaksana/absensi", { status: b.id })
                      .then((res) => setAbsen(res.data?.data || { status: b.id, at }))
                      .catch(() => setAbsen({ status: b.id, at }));
                  } else {
                    setAbsen({ status: b.id, at });
                  }
                }}
                className="px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function PanelTugasKanban() {
    const [submitTarget, setSubmitTarget] = useState(null); // task yang sedang di-submit

    const list = Array.isArray(tasks) ? tasks : [];
    const toCol = (t) => {
      const st = String(t.status || "pending").toLowerCase();
      if (st.includes("returned")) return "dikembalikan";
      if (st === "in_progress") return "berjalan";
      if (st === "accepted" || st === "assigned" || st === "pending") return "belum";
      return "belum";
    };
    const cols = {
      belum: list.filter((t) => toCol(t) === "belum"),
      berjalan: list.filter((t) => toCol(t) === "berjalan"),
      dikembalikan: list.filter((t) => toCol(t) === "dikembalikan"),
    };

    async function refreshTasks() {
      const res = await api.get("/api/pelaksana/tugas", { params: { limit: 15 } });
      setTasks(Array.isArray(res.data?.data) ? res.data.data : []);
    }

    const Col = ({ title, items, tone }) => (
      <div className="rounded-xl border border-gray-100 bg-white p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-bold text-gray-700">{title}</div>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              tone === "amber"
                ? "bg-amber-100 text-amber-700"
                : tone === "blue"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-red-100 text-red-700"
            }`}
          >
            {items.length}
          </span>
        </div>
        <div className="space-y-2">
          {items.slice(0, 6).map((t) => {
            const due = t.due_date || t.deadline;
            const st = String(t.status || "pending").toLowerCase();
            const isOverdue = due && new Date(due) < new Date();
            const revisiKe = Number(t.revisi_ke || 0);
            return (
              <div key={t.id} className={`rounded-lg border px-3 py-2 ${
                st.includes("returned")
                  ? "border-red-200 bg-red-50"
                  : "border-gray-100 bg-gray-50"
              }`}>
                <div className="text-xs font-semibold text-gray-800 truncate">
                  {t.priority === "high" && <span className="text-red-500 mr-1">🔴</span>}
                  {t.judul || t.title || "—"}
                </div>
                <div className={`text-[11px] mt-0.5 ${isOverdue ? "text-red-600 font-semibold" : "text-gray-500"}`}>
                  {due
                    ? `Deadline: ${new Date(due).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}${isOverdue ? " ⚠️ Overdue" : ""}`
                    : "Deadline: —"}
                </div>
                {/* Catatan revisi dari Kasubag */}
                {st.includes("returned") && t.catatan_verifikasi && (
                  <div className="mt-1.5 text-[11px] text-red-700 bg-white border border-red-200 rounded px-2 py-1">
                    <span className="font-bold">Catatan Kasubag:</span> {t.catatan_verifikasi}
                    {revisiKe > 0 && <span className="ml-1 text-red-500">(revisi ke-{revisiKe})</span>}
                  </div>
                )}
                {isSekretariat && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(st === "assigned" || st === "pending") && (
                      <button
                        type="button"
                        onClick={async () => { await api.post(`/api/pelaksana/tugas/${t.id}/terima`); await refreshTasks(); }}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 text-white hover:bg-slate-700 font-semibold"
                      >
                        Terima
                      </button>
                    )}
                    {(st === "accepted" || st === "assigned") && (
                      <button
                        type="button"
                        onClick={async () => { await api.post(`/api/pelaksana/tugas/${t.id}/mulai`); await refreshTasks(); }}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold"
                      >
                        Mulai
                      </button>
                    )}
                    {(st === "in_progress" || st === "returned_to_pelaksana") && (
                      <button
                        type="button"
                        onClick={() => setSubmitTarget(t)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-semibold"
                      >
                        {revisiKe > 0 ? `📝 Kirim Revisi (${revisiKe}×)` : "📤 Submit Hasil"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {items.length === 0 && (
            <div className="text-xs text-gray-400 italic">Tidak ada item.</div>
          )}
        </div>
      </div>
    );

    return (
      <>
        {/* Modal submit hasil tugas */}
        {submitTarget && (
          <SubmitHasilModal
            task={submitTarget}
            onClose={() => setSubmitTarget(null)}
            onSuccess={refreshTasks}
          />
        )}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
            <h2 className="font-bold text-gray-800 text-base sm:text-lg shrink-0">📋 Tugas Saya Hari Ini</h2>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-end">
              {["Semua", "Aktif", "Rutin", "Overdue"].map((f) => (
                <span
                  key={f}
                  className="text-[11px] px-2 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold whitespace-nowrap shrink-0"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
          {loading ? (
            <p className="text-sm text-gray-400 animate-pulse">Memuat tugas…</p>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Col title="⏳ BELUM MULAI" items={cols.belum} tone="amber" />
                <Col title="🔄 SEDANG BERJALAN" items={cols.berjalan} tone="blue" />
                <Col title="↩️ DIKEMBALIKAN" items={cols.dikembalikan} tone="red" />
              </div>
              <div className="mt-3 text-xs text-gray-500 border-t border-gray-100 pt-3 flex flex-wrap gap-3">
                <span className="font-semibold">{inProgress + pending} tugas aktif</span>
                <span>{returned} dikembalikan</span>
                <span>{done} selesai</span>
                <span className={overdue > 0 ? "text-red-600 font-semibold" : ""}>
                  {overdue} overdue
                </span>
              </div>
            </>
          )}
        </div>
      </>
    );
  }

  function PanelDikembalikan() {
    const [rows, setRows] = useState([]);
    const [loadingRows, setLoadingRows] = useState(true);

    useEffect(() => {
      setLoadingRows(true);
      api
        .get("/api/pelaksana/dikembalikan", { params: { limit: 10 } })
        .then((res) => setRows(Array.isArray(res.data?.data) ? res.data.data : []))
        .catch(() => setRows([]))
        .finally(() => setLoadingRows(false));
    }, []);
    return (
      <div className="bg-white rounded-xl border border-red-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-800">❌ Dikembalikan — Perlu Diperbaiki</h2>
          {rows.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold">
              {rows.length}
            </span>
          )}
        </div>
        {loadingRows ? (
          <p className="text-sm text-gray-400 animate-pulse">Memuat…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-gray-400 italic">Tidak ada item yang dikembalikan.</p>
        ) : (
          <div className="space-y-2">
            {rows.slice(0, 6).map((t) => (
              <div key={t.id} className="bg-red-50 border border-red-100 rounded-lg p-3">
                <div className="text-sm font-semibold text-gray-800">
                  {t.sub_type ? String(t.sub_type).toUpperCase() : t.tipe || `Item #${t.id}`}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  Catatan revisi:{" "}
                  <span className="text-gray-700">
                    {t.catatan_revisi || "Perlu perbaikan sesuai catatan JF."}
                  </span>
                </div>
                {t.ringkas && (
                  <div className="text-[11px] text-gray-500 mt-1">
                    Ringkas: {t.ringkas}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const renderKetersediaanContent = () => {
    switch (activeMenu) {
      case "overview":
        return (
          <div className="space-y-6">
            <AbsensiStrip />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {kpiMini.map((kpi) => (
                <div
                  key={kpi.label}
                  className={`rounded-xl border p-4 flex flex-col gap-1 bg-${kpi.color}-50 border-${kpi.color}-200`}
                >
                  <div className={`text-3xl font-bold text-${kpi.color}-700`}>
                    {kpi.value}
                  </div>
                  <div className={`text-xs font-medium text-${kpi.color}-600`}>
                    {kpi.label}
                  </div>
                </div>
              ))}
            </div>
            <PanelTugasKanban />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ModulInputDataPanganKetersediaan unitKerja={user?.unit_kerja} />
              <PanelDikembalikan />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-bold text-gray-800 mb-3">👤 Status Kepegawaian Saya (read-only)</h2>
                <p className="text-sm text-gray-500">
                  Data ini bersifat pribadi. (Placeholder) — akan dihubungkan ke modul kepegawaian/ASN.
                </p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-bold text-gray-800 mb-3">📅 Jadwal & Pengingat</h2>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Reminder: Pastikan data lapangan hari ini sudah disubmit ke JF.</li>
                  <li>• Reminder: Periksa item yang dikembalikan.</li>
                </ul>
              </div>
            </div>
          </div>
        );
      case "tasks":
        return <PanelTugasKanban />;
      case "komunikasi":
        return (
          <KomunikasiPanel
            lane={KOM_LANES.ES4_OPERATOR}
            titleTanggapan="Tanggapan ke atasan (task Anda)"
            titleDiskusi="Diskusi dengan Kasubag / JF (task)"
          />
        );
      case "data-pangan":
        return <ModulInputDataPanganKetersediaan unitKerja={user?.unit_kerja} />;
      case "dikembalikan":
        return <PanelDikembalikan />;
      case "absensi":
        return <AbsensiHarianPanel />;
      // ── Modul Sekretariat (Pelaksana Sekretariat) ─────────────────────────
      case "surat":
        return (
          <div className="space-y-5">
            <ModulFormPanel modulId="M011" title="Surat Masuk" layout="two-column" showHistory />
            <ModulFormPanel modulId="M012" title="Surat Keluar" layout="two-column" showHistory />
            <ModulFormPanel modulId="M013" title="Disposisi Surat" layout="two-column" showHistory />
          </div>
        );
      case "sppd":
        return <ModulFormPanel modulId="M006" title="SPPD / Perjalanan Dinas" layout="two-column" showHistory />;
      case "kinerja":
        return <ModulFormPanel modulId="M008" title="SKP (Sasaran Kinerja Pegawai)" layout="two-column" showHistory />;
      case "slip-gaji":
        return <ModulFormPanel modulId="M024" title="Belanja Pegawai" layout="two-column" showHistory />;
      case "lapor-aset":
        return <ModulFormPanel modulId="M016" title="Data Aset Barang" layout="two-column" showHistory />;
      // ── Modul adaptif berdasarkan unit_kerja (mod-*) ──────────────────────
      default: {
        if (activeMenu?.startsWith("mod-")) {
          const modulId = activeMenu.replace("mod-", "");
          return <ModulFormPanel modulId={modulId} layout="two-column" showHistory />;
        }
        return (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
            <p className="text-gray-400 text-sm">Modul ini sedang dalam pengembangan.</p>
          </div>
        );
      }
    }
  };

  const renderLegacy = () => (
    <div className="min-h-[100dvh] h-[100dvh] flex flex-col bg-slate-50 overflow-hidden">
      <DashboardNotificationStrip />
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-y-contain">
        <div className="max-w-7xl mx-auto w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 pb-[max(1rem,env(safe-area-inset-bottom))]">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-900/95 to-slate-900/80 border-2 border-blue-700/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
            <span className="text-3xl sm:text-4xl shrink-0" aria-hidden>
              ⚙️
            </span>
            <span className="min-w-0">Dashboard Pelaksana</span>
          </h1>
          <UploadSuratMasukQuickAction />
        </div>
        <p className="text-blue-200/80 text-sm">
          Selamat datang,{" "}
          <span className="font-semibold text-white">
            {user?.nama_lengkap || user?.name || "—"}
          </span>{" "}
          · Unit: {user?.unit_kerja || "—"}
        </p>
        {isDistribusi && <ProgressCoverageHariIniStrip />}
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Tugas",
            value: loading ? "…" : tasks.length,
            color: "blue",
          },
          {
            label: "Sedang Dikerjakan",
            value: loading ? "…" : inProgress,
            color: "amber",
          },
          { label: "Selesai", value: loading ? "…" : done, color: "emerald" },
          { label: "Menunggu", value: loading ? "…" : pending, color: "gray" },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className={`rounded-xl border p-4 flex flex-col gap-1 bg-${kpi.color}-50 border-${kpi.color}-200`}
          >
            <div className={`text-3xl font-bold text-${kpi.color}-700`}>
              {kpi.value}
            </div>
            <div className={`text-xs font-medium text-${kpi.color}-600`}>
              {kpi.label}
            </div>
          </div>
        ))}
      </div>

      {/* Progres Bar Keseluruhan */}
      {!loading && tasks.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-800 mb-2">
            📈 Progress Keseluruhan
          </h2>
          <div className="h-3 rounded-full bg-gray-200 overflow-hidden mb-1">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${Math.round((done / tasks.length) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">
            {done} dari {tasks.length} tugas selesai (
            {Math.round((done / tasks.length) * 100)}%)
          </p>
        </div>
      )}

      {/* Daftar Tugas */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-800 mb-4">📋 Tugas Saya</h2>
        {loading ? (
          <p className="text-sm text-gray-500 animate-pulse">Memuat tugas…</p>
        ) : tasks.length === 0 ? (
          <p className="text-sm text-gray-400 italic">
            Belum ada tugas yang ditugaskan.
          </p>
        ) : (
          <div className="space-y-3">
            {tasks.map((t, i) => (
              <div
                key={t.id ?? i}
                className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {t.judul || t.title || "—"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {t.modul_id || t.modulId || ""}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${PROGRESS_COLOR[t.status] ?? "bg-gray-300"}`}
                  />
                  <span className="text-xs text-gray-600 whitespace-nowrap">
                    {t.status || "pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modul data lapangan — Ketersediaan vs Distribusi */}
      {showDataPangan && !isDistribusi && unitKerja.includes("ketersediaan") && (
        <ModulInputDataPanganKetersediaan unitKerja={user?.unit_kerja} />
      )}
      {showDataPangan && isDistribusi && <FormInputHargaPasar />}
      {showDataPangan && isKonsumsi && (
        <FormInputDataKonsumsi
          jenisTugas={
            tasks.find((t) => t?.metadata?.jenis_tugas)?.metadata?.jenis_tugas ??
            tasks.find((t) => t?.metadata?.sub_type)?.metadata?.sub_type ??
            null
          }
        />
      )}

      {/* Target Kegiatan Saya (read-only) — Bagian IV, Role 6 */}
      <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          🎯 Target Sub-Kegiatan Saya (Read-Only)
        </h2>
        <p className="text-xs text-gray-500 mb-3">
          Daftar target sub-kegiatan unit kerja Anda. Kontribusi Anda terhadap
          perencanaan adalah melalui <strong>data operasional</strong> yang Anda
          input (stok, distribusi, lapangan) — data ini digunakan JF untuk
          menyusun Renstra berbasis data. Anda <strong>tidak</strong> mengakses
          form Renstra/Renja langsung.
        </p>
        <div className="flex flex-wrap gap-2">
          <BukaEPelaraButton
            label="Lihat Target (read-only) →"
            targetPath="/dashboard-renstra"
            className="!py-1.5 !px-3 !text-xs"
          />
          <BukaEPelaraButton
            label="Input Data Teknis Lapangan"
            targetPath="/input-laporan"
            className="!py-1.5 !px-3 !text-xs"
          />
        </div>
      </div>

      {/* e-Pelara */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-800 mb-2">Akses e-Pelara</h2>
        <p className="text-xs text-gray-500 mb-3">
          Sebagai <strong>DRAFTER</strong> — Anda dapat membuat dan mengupdate
          draft dokumen perencanaan.
        </p>
        <BukaEPelaraButton
          label="Buka e-Pelara"
          targetPath="/"
          className="w-full md:w-auto"
        />
      </div>
        </div>
      </div>
    </div>
  );

  const isSidebarVariant =
    isSekretariat || isKetersediaan || isDistribusi || isKonsumsi || isUptd;
  if (!isSidebarVariant) return renderLegacy();

  const menuActive = isSekretariat
    ? menuSekretariat
    : isKetersediaan
      ? menuKetersediaan
      : isDistribusi
        ? menuDistribusi
        : isKonsumsi
          ? menuKonsumsi
          : isUptdTu
            ? menuUptdTu
            : isUptdMutu
              ? menuUptdMutu
              : isUptdTeknis
                ? menuUptdTeknis
                : isUptd
                  ? menuUptdTeknis  // fallback UPTD generic → pakai menu teknis
                  : menuUptdTeknis;

  const renderSidebarContent = () => {
    switch (activeMenu) {
      case "overview":
        return (
          <div className="space-y-6">
            <AbsensiStrip />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {kpiMini.map((kpi) => (
                <div
                  key={kpi.label}
                  className={`rounded-xl border p-4 flex flex-col gap-1 bg-${kpi.color}-50 border-${kpi.color}-200`}
                >
                  <div className={`text-3xl font-bold text-${kpi.color}-700`}>
                    {kpi.value}
                  </div>
                  <div className={`text-xs font-medium text-${kpi.color}-600`}>
                    {kpi.label}
                  </div>
                </div>
              ))}
            </div>
            <PanelTugasKanban />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {isSekretariat ? (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-bold text-gray-800">📄 SPJ Saya — Status Terkini</h2>
                    <Badge n={spjRows.length} />
                  </div>
                  <div className="text-xs text-gray-500 mb-3">
                    SPJ hanya dibuat oleh Pelaksana, lalu dikirim ke Bendahara Pengeluaran.
                  </div>
                  {spjLoading ? (
                    <p className="text-sm text-gray-400 animate-pulse">Memuat…</p>
                  ) : spjRows.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">Belum ada SPJ.</p>
                  ) : (
                    <div className="space-y-2">
                      {spjRows.slice(0, 4).map((s) => (
                        <div key={s.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                          <div className="text-sm font-bold text-slate-900">
                            {s.nomor_spj || `SPJ#${s.id}`} • {s.jenis_belanja} •{" "}
                            <span className="font-mono text-xs">{rupiah(s.nominal)}</span>
                          </div>
                          <div className="text-xs text-slate-600 mt-1">Status: {s.status}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-3">
                    <button
                      onClick={() => setActiveMenu("buat-spj")}
                      className="text-xs px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                    >
                      + Buat SPJ Baru
                    </button>
                  </div>
                </div>
              ) : isKetersediaan ? (
                <ModulInputDataPanganKetersediaan unitKerja={user?.unit_kerja} />
              ) : isDistribusi ? (
                <FormInputHargaPasar />
              ) : (
                <FormInputDataKonsumsi
                  jenisTugas={
                    tasks.find((t) => t?.metadata?.jenis_tugas)?.metadata?.jenis_tugas ??
                    tasks.find((t) => t?.metadata?.sub_type)?.metadata?.sub_type ??
                    null
                  }
                />
              )}
              {isSekretariat ? (
                <div className="bg-white rounded-xl border border-red-100 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-bold text-gray-800">❌ Dikembalikan — Perlu Diperbaiki</h2>
                    <Badge n={spjReturned.length} tone="danger" />
                  </div>
                  {spjReturnedLoading ? (
                    <p className="text-sm text-gray-400 animate-pulse">Memuat…</p>
                  ) : spjReturned.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">Tidak ada SPJ dikembalikan.</p>
                  ) : (
                    <div className="space-y-2">
                      {spjReturned.slice(0, 4).map((s) => (
                        <div key={s.id} className="rounded-lg border border-red-200 bg-red-50 p-3">
                          <div className="text-sm font-bold text-slate-900">
                            {s.nomor_spj || `SPJ#${s.id}`} • {s.jenis_belanja}
                          </div>
                          <div className="text-xs text-slate-700 mt-1 whitespace-pre-wrap">
                            Catatan: {s.catatan_bendahara || s.catatan_ppk || "—"}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <PanelDikembalikan />
              )}
            </div>
          </div>
        );
      case "tasks":
        return <PanelTugasKanban />;
      case "komunikasi":
        return (
          <KomunikasiPanel
            lane={KOM_LANES.ES4_OPERATOR}
            titleTanggapan="Tanggapan ke atasan (task Anda)"
            titleDiskusi="Diskusi dengan Kasubag / JF (task)"
          />
        );
      case "buat-spj":
        return (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="font-bold text-slate-900 mb-2">➕ Buat SPJ Baru</div>
            <div className="text-xs text-slate-500 mb-4">
              SPJ akan otomatis disubmit ke Bendahara Pengeluaran setelah dibuat.
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setSpjSubmitting(true);
                try {
                  const payload = {
                    jenis_belanja: spjForm.jenis_belanja,
                    sub_kegiatan_kode: spjForm.sub_kegiatan_kode,
                    kode_rekening: spjForm.kode_rekening,
                    nominal: Number(spjForm.nominal || 0),
                    keterangan: spjForm.keterangan,
                    tanggal_kegiatan: spjForm.tanggal_kegiatan,
                    lampiran_url: spjForm.lampiran_url || null,
                  };
                  const created = await api.post("/api/pelaksana/spj", payload);
                  const id = created.data?.data?.id;
                  if (id) await api.post(`/api/pelaksana/spj/${id}/submit`);
                  const [r1, r2] = await Promise.allSettled([
                    api.get("/api/pelaksana/spj", { params: { limit: 10 } }),
                    api.get("/api/pelaksana/spj/dikembalikan", { params: { limit: 10 } }),
                  ]);
                  if (r1.status === "fulfilled") {
                    setSpjRows(Array.isArray(r1.value.data?.data) ? r1.value.data.data : []);
                  }
                  if (r2.status === "fulfilled") {
                    setSpjReturned(Array.isArray(r2.value.data?.data) ? r2.value.data.data : []);
                  }
                  setActiveMenu("spj");
                } finally {
                  setSpjSubmitting(false);
                }
              }}
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              <div>
                <label className="text-xs text-slate-600 block mb-1">Jenis</label>
                <select
                  value={spjForm.jenis_belanja}
                  onChange={(e) =>
                    setSpjForm((f) => ({ ...f, jenis_belanja: e.target.value }))
                  }
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="perjalanan_dinas">SPPD / Perjalanan Dinas</option>
                  <option value="honorarium">Honor</option>
                  <option value="atk">ATK / Pembelian</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-600 block mb-1">Tanggal</label>
                <input
                  type="date"
                  value={spjForm.tanggal_kegiatan}
                  onChange={(e) =>
                    setSpjForm((f) => ({ ...f, tanggal_kegiatan: e.target.value }))
                  }
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 block mb-1">Nominal</label>
                <input
                  value={spjForm.nominal}
                  onChange={(e) => setSpjForm((f) => ({ ...f, nominal: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 block mb-1">Kode rekening</label>
                <input
                  value={spjForm.kode_rekening}
                  onChange={(e) =>
                    setSpjForm((f) => ({ ...f, kode_rekening: e.target.value }))
                  }
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-slate-600 block mb-1">Keterangan</label>
                <textarea
                  value={spjForm.keterangan}
                  onChange={(e) =>
                    setSpjForm((f) => ({ ...f, keterangan: e.target.value }))
                  }
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  rows={3}
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-slate-600 block mb-1">Lampiran URL (opsional)</label>
                <input
                  value={spjForm.lampiran_url}
                  onChange={(e) =>
                    setSpjForm((f) => ({ ...f, lampiran_url: e.target.value }))
                  }
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="md:col-span-2 flex gap-2">
                <button
                  disabled={spjSubmitting}
                  className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-sm font-semibold disabled:opacity-60"
                >
                  {spjSubmitting ? "Mengirim…" : "Buat & Submit ke Bendahara"}
                </button>
              </div>
            </form>
          </div>
        );
      case "spj":
        return <SpjPelaksanaPanel />;
      case "data-pangan":
        return <ModulInputDataPanganKetersediaan unitKerja={user?.unit_kerja} />;
      case "harga-pasar":
        return <FormInputHargaPasar />;
      case "data-konsumsi":
        return (
          <FormInputDataKonsumsi
            jenisTugas={
              tasks.find((t) => t?.metadata?.jenis_tugas)?.metadata?.jenis_tugas ??
              tasks.find((t) => t?.metadata?.sub_type)?.metadata?.sub_type ??
              null
            }
          />
        );
      case "uptd-admin-tu":
        return <FormInputAdminTU />;
      case "uptd-sertifikasi":
        return <FormInputSertifikasiUptd />;
      case "uptd-uji-lab":
        return <FormInputUjiLabUptd />;
      case "dikembalikan":
        return <PanelDikembalikan />;
      case "absensi":
        return <AbsensiHarianPanel />;
      default:
        return (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
            <p className="text-gray-400 text-sm">Modul ini sedang dalam pengembangan.</p>
          </div>
        );
    }
  };

  return (
    <div
      className={`flex flex-col min-h-[100dvh] h-[100dvh] overflow-hidden ${
        themeUptdPl
          ? "bg-gradient-to-br from-slate-400/40 via-slate-300/50 to-slate-400/35 text-slate-900"
          : "bg-gray-50 text-slate-900"
      }`}
    >
      <DashboardNotificationStrip />
      <div className="flex flex-1 min-h-0 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:static top-11 bottom-0 left-0 lg:top-auto lg:inset-y-0 z-40 w-[min(280px,88vw)] lg:w-64 shrink-0 flex flex-col transition-transform duration-200 ease-out ${
          themeUptdPl
            ? "bg-slate-950 border-r border-teal-900/40"
            : "bg-slate-900"
        }`}
      >
        <div className="p-4 sm:p-5 border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-2xl shrink-0" aria-hidden>
              🏛️
            </span>
            <div className="min-w-0">
              <p className="font-bold text-white text-sm truncate">SIGAP-MALUT</p>
              <p className="text-xs text-slate-400 truncate max-w-[180px]" title={user?.jabatan || ""}>
                {user?.jabatan
                  ? user.jabatan
                  : isSekretariat
                    ? "Pelaksana Sekretariat"
                    : isKetersediaan
                      ? "Pelaksana Ketersediaan"
                      : isDistribusi
                        ? "Pelaksana Distribusi"
                        : isKonsumsi
                          ? "Pelaksana Konsumsi"
                          : isUptdTu
                            ? "Pelaksana TU UPTD"
                            : isUptdMutu
                              ? "Pelaksana Mutu UPTD"
                              : isUptdTeknis
                                ? "Pelaksana Teknis UPTD"
                                : "Pelaksana"}
              </p>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-3 space-y-1 min-h-0">
          {menuActive.map((item, i) => {
            if (item.divider) {
              return (
                <div key={i} className="px-3 pt-3 pb-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {item.label}
                  </p>
                </div>
              );
            }
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveMenu(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-2 px-2.5 sm:px-3 py-2 rounded-lg text-left text-xs sm:text-sm transition touch-manipulation ${
                  activeMenu === item.id
                    ? themeUptdPl
                      ? "bg-teal-700 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
                      : "bg-green-600 text-white"
                    : themeUptdPl
                      ? "text-slate-300 hover:bg-slate-800 hover:text-white"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className="shrink-0">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </span>
                {item.badge != null && (
                  <span className="px-1.5 py-0.5 rounded-full text-xs bg-amber-500 text-white font-bold min-w-[18px] text-center">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        <div className="p-3 sm:p-4 border-t border-slate-700 shrink-0">
          <BukaEPelaraButton label="e-Pelara" targetPath="/" className="w-full !py-2 !text-xs" />
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Tutup menu"
          className="fixed inset-0 bg-black/50 z-30 lg:hidden border-0 cursor-default"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        {/* Header */}
        <header
          className={`border-b px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shrink-0 ${
            themeUptdPl
              ? "bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 border-teal-900/50"
              : "bg-gradient-to-r from-blue-900/95 to-slate-900/80 border-blue-700/50"
          }`}
        >
          <div className="flex items-start gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              className="lg:hidden shrink-0 text-white p-2 rounded-lg hover:bg-white/10 touch-manipulation"
              onClick={() => setSidebarOpen(true)}
              aria-label="Buka menu"
            >
              ☰
            </button>
            <div className="min-w-0">
              <h1 className="font-bold text-white text-base sm:text-lg truncate">
                Halo, {user?.nama_lengkap || user?.name || "—"}
              </h1>
              <p
                className={`text-[11px] sm:text-xs leading-snug ${
                  themeUptdPl ? "text-teal-100/85" : "text-blue-200/70"
                }`}
              >
                {user?.jabatan
                  ? user.jabatan
                  : isSekretariat
                    ? "Pelaksana Sekretariat"
                    : isKetersediaan
                      ? "Pelaksana Bidang Ketersediaan"
                      : isDistribusi
                        ? "Pelaksana Bidang Distribusi"
                        : isKonsumsi
                          ? "Pelaksana Bidang Konsumsi"
                          : isUptdTu
                            ? "Pelaksana TU UPTD"
                            : isUptdMutu
                              ? "Pelaksana Mutu UPTD"
                              : isUptdTeknis
                                ? "Pelaksana Teknis UPTD"
                                : "Pelaksana"}{" "}
                ·{" "}
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 shrink-0 w-full sm:w-auto">
            <UploadSuratMasukQuickAction />
            <span className="px-2 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-amber-200 text-[11px] sm:text-xs font-medium whitespace-nowrap">
              🔔 {loading ? "…" : tasks.length} notif
            </span>
          </div>
        </header>

        {/* Content */}
        <main
          className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-y-contain pb-[max(1rem,env(safe-area-inset-bottom))] ${
            themeUptdPl
              ? "p-4 sm:p-5 md:p-6 lg:px-10 xl:px-14 2xl:px-16 bg-gradient-to-b from-slate-300/35 to-slate-400/25 text-slate-900 max-w-[1920px] w-full mx-auto [&_.bg-white]:!bg-slate-100/95 [&_.border-gray-100]:!border-slate-400/35 [&_.text-gray-800]:!text-slate-900 [&_.text-gray-700]:!text-slate-800 [&_.text-gray-600]:!text-slate-700 [&_.text-gray-500]:!text-slate-600 [&_.text-gray-400]:!text-slate-500"
              : "p-3 sm:p-4 md:p-6"
          }`}
        >
          {renderSidebarContent()}
        </main>
      </div>
      </div>
    </div>
  );
}
