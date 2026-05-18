import React, { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import { normalizeRoleKey } from "../../utils/normalizeRole";
import UploadSuratMasukQuickAction from "../../components/surat/UploadSuratMasukQuickAction";
import BukaEPelaraButton from "../../components/BukaEPelaraButton";
import SekretariatSubordinateWorkspace from "../../components/coordination/SekretariatSubordinateWorkspace";
import KomunikasiPanel, {
  LANES as KOM_LANES,
} from "../../components/panel/KomunikasiPanel.jsx";
import api from "../../services/api";
import ModulFormPanel from "../../components/ModulFormPanel";
import SpjBendaharaAntrian from "../../components/spj/SpjBendaharaAntrian";
import SpjKonfirmasiWidget from "../../components/spj/SpjKonfirmasiWidget";

const ALLOWED = [
  "bendahara",
  "bendahara_pengeluaran",
  "bendahara_gaji",
  "bendahara_barang",
  "super_admin",
  "sekretaris",
  "kepala_dinas",
];

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
    <span
      className={`text-[11px] px-2 py-0.5 rounded-full border font-bold ${cls}`}
    >
      {n}
    </span>
  );
}

export default function DashboardBendahara() {
  const user = useAuthStore((state) => state.user);
  const roleName = normalizeRoleKey(user);

  const isPengeluaran = roleName === "bendahara_pengeluaran";
  const isGaji = roleName === "bendahara_gaji";
  const isBarang = roleName === "bendahara_barang";

  const title = isPengeluaran
    ? "Bendahara Pengeluaran"
    : isGaji
      ? "Bendahara Gaji"
      : isBarang
        ? "Bendahara Barang"
        : "Bendahara";

  const isAllowed = !!user && ALLOWED.includes(roleName);
  if (!isAllowed) return <Navigate to="/" replace />;

  const [coordinationHighlightId, setCoordinationHighlightId] = useState(null);
  const [active, setActive] = useState("overview");
  const [searchParams, setSearchParams] = useSearchParams();
  const processedCoordTaskRef = useRef(null);

  useEffect(() => {
    const raw = searchParams.get("coordinationTask");
    if (!raw || processedCoordTaskRef.current === raw) return;
    const id = Number(raw);
    if (!Number.isFinite(id)) return;
    processedCoordTaskRef.current = raw;
    setActive("inbox");
    setCoordinationHighlightId(id);
    setSearchParams(
      (prev) => {
        const n = new URLSearchParams(prev);
        n.delete("coordinationTask");
        return n;
      },
      { replace: true },
    );
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (coordinationHighlightId == null) return;
    const t = setTimeout(() => setCoordinationHighlightId(null), 8000);
    return () => clearTimeout(t);
  }, [coordinationHighlightId]);

  const coordinationWorkspace = (
    <SekretariatSubordinateWorkspace
      actorRole={roleName}
      actorLabel={title}
      highlightTaskId={coordinationHighlightId}
    />
  );

  const baseUrl = isPengeluaran
    ? "/api/bendahara-pengeluaran"
    : isGaji
      ? "/api/bendahara-gaji"
      : isBarang
        ? "/api/bendahara-barang"
      : "/api/bendahara-pengeluaran";

  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [inbox, setInbox] = useState([]);
  const [inboxLoading, setInboxLoading] = useState(true);

  // Bendahara Gaji
  const [dgBulanIni, setDgBulanIni] = useState(null);
  const [dgBulanIniLoading, setDgBulanIniLoading] = useState(true);
  const [dgRows, setDgRows] = useState([]);
  const [dgLoading, setDgLoading] = useState(true);
  const [dgDikembalikan, setDgDikembalikan] = useState([]);
  const [dgDikembalikanLoading, setDgDikembalikanLoading] = useState(true);

  // Bendahara Barang
  const [bbAsetSummary, setBbAsetSummary] = useState(null);
  const [bbAsetSummaryLoading, setBbAsetSummaryLoading] = useState(true);
  const [bbAsetKritis, setBbAsetKritis] = useState([]);
  const [bbAsetKritisLoading, setBbAsetKritisLoading] = useState(true);
  const [bbPenerimaanPending, setBbPenerimaanPending] = useState([]);
  const [bbPenerimaanPendingLoading, setBbPenerimaanPendingLoading] =
    useState(true);
  const [bbDikembalikanPpk, setBbDikembalikanPpk] = useState([]);
  const [bbDikembalikanPpkLoading, setBbDikembalikanPpkLoading] =
    useState(true);
  const [bbPemeliharaan, setBbPemeliharaan] = useState([]);
  const [bbPemeliharaanLoading, setBbPemeliharaanLoading] = useState(true);
  const [bbKerusakanMasuk, setBbKerusakanMasuk] = useState([]);
  const [bbKerusakanMasukLoading, setBbKerusakanMasukLoading] = useState(true);
  const [spjMasuk, setSpjMasuk] = useState([]);
  const [spjMasukLoading, setSpjMasukLoading] = useState(true);
  const [spjSiapBayar, setSpjSiapBayar] = useState([]);
  const [spjSiapBayarLoading, setSpjSiapBayarLoading] = useState(true);
  const [spjDikembalikanPpk, setSpjDikembalikanPpk] = useState([]);
  const [spjDikembalikanPpkLoading, setSpjDikembalikanPpkLoading] =
    useState(true);

  async function refreshAll() {
    if (!user || (!isPengeluaran && !isGaji && !isBarang)) return;
    await api
      .get(`${baseUrl}/dashboard/summary`)
      .then((res) => setSummary(res.data?.data || null))
      .catch(() => setSummary(null));

    const reqInbox = api
      .get(`${baseUrl}/inbox-sekretaris`, { params: { limit: 20 } })
      .then((res) => setInbox(Array.isArray(res.data?.data) ? res.data.data : []))
      .catch(() => setInbox([]));

    if (isPengeluaran) {
      await Promise.allSettled([
        reqInbox,
        api
          .get(`${baseUrl}/spj/masuk`, { params: { limit: 30 } })
          .then((res) =>
            setSpjMasuk(Array.isArray(res.data?.data) ? res.data.data : []),
          )
          .catch(() => setSpjMasuk([])),
        api
          .get(`${baseUrl}/spj/siap-dibayar`, { params: { limit: 30 } })
          .then((res) =>
            setSpjSiapBayar(Array.isArray(res.data?.data) ? res.data.data : []),
          )
          .catch(() => setSpjSiapBayar([])),
        api
          .get(`${baseUrl}/spj/dikembalikan-ppk`, { params: { limit: 30 } })
          .then((res) =>
            setSpjDikembalikanPpk(
              Array.isArray(res.data?.data) ? res.data.data : [],
            ),
          )
          .catch(() => setSpjDikembalikanPpk([])),
      ]);
      return;
    }

    if (isGaji) {
      await Promise.allSettled([
        reqInbox,
        api
          .get(`${baseUrl}/daftar-gaji/bulan-ini`)
          .then((res) => setDgBulanIni(res.data?.data || null))
          .catch(() => setDgBulanIni(null)),
        api
          .get(`${baseUrl}/daftar-gaji`, { params: { limit: 24 } })
          .then((res) =>
            setDgRows(Array.isArray(res.data?.data) ? res.data.data : []),
          )
          .catch(() => setDgRows([])),
        api
          .get(`${baseUrl}/dikembalikan`, { params: { limit: 20 } })
          .then((res) =>
            setDgDikembalikan(Array.isArray(res.data?.data) ? res.data.data : []),
          )
          .catch(() => setDgDikembalikan([])),
      ]);
    }

    if (isBarang) {
      await Promise.allSettled([
        reqInbox,
        api
          .get(`${baseUrl}/aset/summary`)
          .then((res) => setBbAsetSummary(res.data?.data || null))
          .catch(() => setBbAsetSummary(null)),
        api
          .get(`${baseUrl}/aset/kondisi-kritis`, { params: { limit: 20 } })
          .then((res) =>
            setBbAsetKritis(Array.isArray(res.data?.data) ? res.data.data : []),
          )
          .catch(() => setBbAsetKritis([])),
        api
          .get(`${baseUrl}/penerimaan/pending`, { params: { limit: 20 } })
          .then((res) =>
            setBbPenerimaanPending(
              Array.isArray(res.data?.data) ? res.data.data : [],
            ),
          )
          .catch(() => setBbPenerimaanPending([])),
        api
          .get(`${baseUrl}/penerimaan/dikembalikan-ppk`, { params: { limit: 20 } })
          .then((res) =>
            setBbDikembalikanPpk(
              Array.isArray(res.data?.data) ? res.data.data : [],
            ),
          )
          .catch(() => setBbDikembalikanPpk([])),
        api
          .get(`${baseUrl}/pemeliharaan/mendatang-30hari`, { params: { limit: 30 } })
          .then((res) =>
            setBbPemeliharaan(Array.isArray(res.data?.data) ? res.data.data : []),
          )
          .catch(() => setBbPemeliharaan([])),
        api
          .get(`${baseUrl}/kerusakan/masuk`, { params: { limit: 20 } })
          .then((res) =>
            setBbKerusakanMasuk(
              Array.isArray(res.data?.data) ? res.data.data : [],
            ),
          )
          .catch(() => setBbKerusakanMasuk([])),
      ]);
    }
  }

  useEffect(() => {
    if (!user || (!isPengeluaran && !isGaji && !isBarang)) return;
    setSummaryLoading(true);
    api
      .get(`${baseUrl}/dashboard/summary`)
      .then((res) => setSummary(res.data?.data || null))
      .catch(() => setSummary(null))
      .finally(() => setSummaryLoading(false));
  }, [user, isPengeluaran, isGaji, isBarang, baseUrl]);

  useEffect(() => {
    if (!user || (!isPengeluaran && !isGaji && !isBarang)) return;
    setInboxLoading(true);
    api
      .get(`${baseUrl}/inbox-sekretaris`, { params: { limit: 20 } })
      .then((res) => setInbox(Array.isArray(res.data?.data) ? res.data.data : []))
      .catch(() => setInbox([]))
      .finally(() => setInboxLoading(false));
  }, [user, isPengeluaran, isGaji, isBarang, baseUrl]);

  useEffect(() => {
    if (!user || !isPengeluaran) return;
    setSpjMasukLoading(true);
    api
      .get(`${baseUrl}/spj/masuk`, { params: { limit: 30 } })
      .then((res) =>
        setSpjMasuk(Array.isArray(res.data?.data) ? res.data.data : []),
      )
      .catch(() => setSpjMasuk([]))
      .finally(() => setSpjMasukLoading(false));
  }, [user, isPengeluaran]);

  useEffect(() => {
    if (!user || !isPengeluaran) return;
    setSpjSiapBayarLoading(true);
    api
      .get(`${baseUrl}/spj/siap-dibayar`, { params: { limit: 30 } })
      .then((res) =>
        setSpjSiapBayar(Array.isArray(res.data?.data) ? res.data.data : []),
      )
      .catch(() => setSpjSiapBayar([]))
      .finally(() => setSpjSiapBayarLoading(false));
  }, [user, isPengeluaran]);

  useEffect(() => {
    if (!user || !isGaji) return;
    setDgBulanIniLoading(true);
    api
      .get(`${baseUrl}/daftar-gaji/bulan-ini`)
      .then((res) => setDgBulanIni(res.data?.data || null))
      .catch(() => setDgBulanIni(null))
      .finally(() => setDgBulanIniLoading(false));
  }, [user, isGaji, baseUrl]);

  useEffect(() => {
    if (!user || !isBarang) return;
    setBbAsetSummaryLoading(true);
    api
      .get(`${baseUrl}/aset/summary`)
      .then((res) => setBbAsetSummary(res.data?.data || null))
      .catch(() => setBbAsetSummary(null))
      .finally(() => setBbAsetSummaryLoading(false));
  }, [user, isBarang, baseUrl]);

  useEffect(() => {
    if (!user || !isBarang) return;
    setBbAsetKritisLoading(true);
    api
      .get(`${baseUrl}/aset/kondisi-kritis`, { params: { limit: 20 } })
      .then((res) =>
        setBbAsetKritis(Array.isArray(res.data?.data) ? res.data.data : []),
      )
      .catch(() => setBbAsetKritis([]))
      .finally(() => setBbAsetKritisLoading(false));
  }, [user, isBarang, baseUrl]);

  useEffect(() => {
    if (!user || !isBarang) return;
    setBbPenerimaanPendingLoading(true);
    api
      .get(`${baseUrl}/penerimaan/pending`, { params: { limit: 20 } })
      .then((res) =>
        setBbPenerimaanPending(
          Array.isArray(res.data?.data) ? res.data.data : [],
        ),
      )
      .catch(() => setBbPenerimaanPending([]))
      .finally(() => setBbPenerimaanPendingLoading(false));
  }, [user, isBarang, baseUrl]);

  useEffect(() => {
    if (!user || !isBarang) return;
    setBbDikembalikanPpkLoading(true);
    api
      .get(`${baseUrl}/penerimaan/dikembalikan-ppk`, { params: { limit: 20 } })
      .then((res) =>
        setBbDikembalikanPpk(
          Array.isArray(res.data?.data) ? res.data.data : [],
        ),
      )
      .catch(() => setBbDikembalikanPpk([]))
      .finally(() => setBbDikembalikanPpkLoading(false));
  }, [user, isBarang, baseUrl]);

  useEffect(() => {
    if (!user || !isBarang) return;
    setBbPemeliharaanLoading(true);
    api
      .get(`${baseUrl}/pemeliharaan/mendatang-30hari`, { params: { limit: 30 } })
      .then((res) =>
        setBbPemeliharaan(Array.isArray(res.data?.data) ? res.data.data : []),
      )
      .catch(() => setBbPemeliharaan([]))
      .finally(() => setBbPemeliharaanLoading(false));
  }, [user, isBarang, baseUrl]);

  useEffect(() => {
    if (!user || !isBarang) return;
    setBbKerusakanMasukLoading(true);
    api
      .get(`${baseUrl}/kerusakan/masuk`, { params: { limit: 20 } })
      .then((res) =>
        setBbKerusakanMasuk(
          Array.isArray(res.data?.data) ? res.data.data : [],
        ),
      )
      .catch(() => setBbKerusakanMasuk([]))
      .finally(() => setBbKerusakanMasukLoading(false));
  }, [user, isBarang, baseUrl]);

  useEffect(() => {
    if (!user || !isGaji) return;
    setDgLoading(true);
    api
      .get(`${baseUrl}/daftar-gaji`, { params: { limit: 24 } })
      .then((res) => setDgRows(Array.isArray(res.data?.data) ? res.data.data : []))
      .catch(() => setDgRows([]))
      .finally(() => setDgLoading(false));
  }, [user, isGaji, baseUrl]);

  useEffect(() => {
    if (!user || !isGaji) return;
    setDgDikembalikanLoading(true);
    api
      .get(`${baseUrl}/dikembalikan`, { params: { limit: 20 } })
      .then((res) =>
        setDgDikembalikan(Array.isArray(res.data?.data) ? res.data.data : []),
      )
      .catch(() => setDgDikembalikan([]))
      .finally(() => setDgDikembalikanLoading(false));
  }, [user, isGaji, baseUrl]);

  useEffect(() => {
    if (!user || !isPengeluaran) return;
    setSpjDikembalikanPpkLoading(true);
    api
      .get(`${baseUrl}/spj/dikembalikan-ppk`, { params: { limit: 30 } })
      .then((res) =>
        setSpjDikembalikanPpk(
          Array.isArray(res.data?.data) ? res.data.data : [],
        ),
      )
      .catch(() => setSpjDikembalikanPpk([]))
      .finally(() => setSpjDikembalikanPpkLoading(false));
  }, [user, isPengeluaran]);

  const sidebar = useMemo(() => {
    if (isPengeluaran) {
      return [
        { id: "overview", label: "📊 Dashboard" },
        {
          id: "inbox",
          label: "📥 Inbox Sekretaris",
          badge: summary?.inbox_sekretaris || 0,
          tone: (summary?.inbox_sekretaris || 0) > 0 ? "danger" : "default",
        },
        {
          id: "komunikasi",
          label: "💬 Tanggapan & diskusi",
          badge: null,
          tone: "default",
        },
        {
          id: "spj_masuk",
          label: "📄 SPJ Masuk (Verifikasi)",
          badge: summary?.spj_masuk || 0,
          tone: (summary?.spj_masuk || 0) > 5 ? "warn" : "default",
        },
        {
          id: "siap_bayar",
          label: "✅ Siap Dibayar",
          badge: summary?.siap_dibayar || 0,
        },
        {
          id: "dikembalikan_ppk",
          label: "↩️ Dikembalikan PPK",
          badge: summary?.dikembalikan_ppk || 0,
          tone: (summary?.dikembalikan_ppk || 0) > 0 ? "danger" : "default",
        },
        { id: "divider-keu", label: "── MODUL KEUANGAN ──", disabled: true },
        { id: "mod-dpa", label: "📋 DPA (M020)" },
        { id: "mod-rka", label: "📋 RKA (M021)" },
        { id: "mod-spj-input", label: "📄 Input SPJ (M022)" },
        { id: "mod-realisasi", label: "💰 Realisasi Anggaran (M023)" },
        { id: "mod-belanja-pegawai", label: "👤 Belanja Pegawai (M024)" },
        { id: "mod-belanja-barang", label: "📦 Belanja Barang (M025)" },
        { id: "mod-belanja-modal", label: "🏗️ Belanja Modal (M026)" },
      ];
    }
    if (isGaji) {
      return [
        { id: "overview", label: "📊 Dashboard" },
        {
          id: "inbox",
          label: "📥 Inbox Sekretaris",
          badge: summary?.inbox_sekretaris || 0,
          tone: (summary?.inbox_sekretaris || 0) > 0 ? "danger" : "default",
        },
        {
          id: "dikembalikan",
          label: "↩️ Dikembalikan (JF/Kasubag/Sek)",
          badge: summary?.dikembalikan || 0,
          tone: (summary?.dikembalikan || 0) > 0 ? "danger" : "default",
        },
        {
          id: "perubahan",
          label: "⚠️ Perubahan Kepeg Pending",
          badge: summary?.perubahan_kepeg_pending || 0,
          tone: (summary?.perubahan_kepeg_pending || 0) > 0 ? "warn" : "default",
        },
        {
          id: "daftar_gaji",
          label: "📋 Daftar Gaji Bulanan",
          badge: null,
        },
      ];
    }
    if (isBarang) {
      return [
        { id: "overview", label: "📊 Dashboard" },
        {
          id: "inbox",
          label: "📥 Inbox Sekretaris",
          badge: summary?.inbox_sekretaris || 0,
          tone: (summary?.inbox_sekretaris || 0) > 0 ? "danger" : "default",
        },
        {
          id: "penerimaan",
          label: "📦 Penerimaan Pending",
          badge: summary?.penerimaan_pending || 0,
          tone: (summary?.penerimaan_pending || 0) > 0 ? "warn" : "default",
        },
        {
          id: "dikembalikan_ppk",
          label: "↩️ Dikembalikan PPK",
          badge: summary?.dikembalikan_ppk || 0,
          tone: (summary?.dikembalikan_ppk || 0) > 0 ? "danger" : "default",
        },
        {
          id: "pemeliharaan",
          label: "🔧 Jadwal Pemeliharaan",
          badge: summary?.jadwal_pemeliharaan || 0,
        },
        {
          id: "kerusakan",
          label: "❌ Laporan Kerusakan",
          badge: summary?.kerusakan_masuk || 0,
          tone: (summary?.kerusakan_masuk || 0) > 0 ? "warn" : "default",
        },
        {
          id: "aset_kritis",
          label: "🚨 Aset Kritis",
          badge: summary?.aset_kritis || 0,
          tone: (summary?.aset_kritis || 0) > 0 ? "danger" : "default",
        },
      ];
    }
    return [{ id: "overview", label: "📊 Dashboard" }];
  }, [isPengeluaran, isGaji, isBarang, summary]);

  async function aksiKonfirmasiInbox(task) {
    await api.post(`${baseUrl}/inbox-sekretaris/${task.id}/konfirmasi`);
    await refreshAll();
  }

  async function aksiKembalikan(spj) {
    const catatan = window.prompt(
      "Catatan kekurangan administrasi (wajib):",
      "",
    );
    if (!catatan) return;
    await api.post(`${baseUrl}/spj/${spj.id}/kembalikan`, {
      catatan_bendahara: catatan,
    });
    await refreshAll();
  }

  async function aksiVerifOk(spj) {
    const catatan = window.prompt("Catatan (opsional):", "");
    await api.post(`${baseUrl}/spj/${spj.id}/verifikasi-ok`, {
      catatan_bendahara: catatan || null,
    });
    await refreshAll();
  }

  async function aksiKirimPpk(spj) {
    await api.post(`${baseUrl}/spj/${spj.id}/kirim-ppk`);
    await refreshAll();
  }

  async function aksiBayar(spj) {
    const metode = window.prompt(
      "Metode pembayaran (transfer/tunai):",
      "transfer",
    );
    if (!metode) return;
    const bukti = window.prompt("Nomor bukti (opsional):", "");
    await api.post(`${baseUrl}/spj/${spj.id}/bayar`, {
      metode,
      nomor_bukti: bukti || null,
    });
    await refreshAll();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <aside className="hidden md:block w-[280px] shrink-0 border-r border-slate-200 bg-white min-h-screen">
          <div className="p-5">
            <div className="font-extrabold tracking-tight text-slate-900">
              🏛️ SIGAP-MALUT
            </div>
            <div className="text-xs text-slate-500 mt-1">{title}</div>
          </div>
          <nav className="px-3 pb-6 space-y-1">
            {sidebar.map((it) => (
              <button
                key={it.id}
                onClick={() => setActive(it.id)}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm border ${
                  active === it.id
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-700 border-transparent hover:bg-slate-50"
                }`}
              >
                <span className="truncate">{it.label}</span>
                <Badge n={it.badge} tone={it.tone} />
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
              <div>
                <div className="text-sm text-slate-500">Dashboard</div>
                <div className="text-2xl font-extrabold text-slate-900">
                  {title}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {user?.nama_lengkap || user?.name || user?.username || "—"} •{" "}
                  {user?.unit_kerja || "—"}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <UploadSuratMasukQuickAction showBendaharaHint />
                <BukaEPelaraButton />
                <button
                  onClick={refreshAll}
                  className="text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                >
                  Refresh
                </button>
              </div>
            </div>

            {!isPengeluaran && !isGaji && !isBarang ? (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="font-bold text-slate-900 mb-1">
                  Mode belum aktif
                </div>
                <div className="text-sm text-slate-600">
                  Dashboard ini saat ini baru diaktifkan untuk{" "}
                  <span className="font-semibold">Bendahara Pengeluaran</span>{" "}
                  (Prompt 7) dan <span className="font-semibold">Bendahara Gaji</span>{" "}
                  (Prompt 8). Prompt 9 akan mengaktifkan mode Bendahara Barang.
                </div>
              </div>
            ) : isPengeluaran ? (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-5">
                  {[
                    {
                      label: "Inbox Sekretaris",
                      value: summaryLoading
                        ? "…"
                        : summary?.inbox_sekretaris || 0,
                      tone:
                        (summary?.inbox_sekretaris || 0) > 0
                          ? "bg-red-50 border-red-200 text-red-700"
                          : "bg-white border-slate-200 text-slate-900",
                    },
                    {
                      label: "SPJ Masuk",
                      value: summaryLoading ? "…" : summary?.spj_masuk || 0,
                      tone: "bg-white border-slate-200 text-slate-900",
                    },
                    {
                      label: "Siap Dibayar",
                      value: summaryLoading ? "…" : summary?.siap_dibayar || 0,
                      tone: "bg-white border-slate-200 text-slate-900",
                    },
                    {
                      label: "Saldo UP",
                      value: summaryLoading
                        ? "…"
                        : rupiah(summary?.saldo_up || 0),
                      tone:
                        (summary?.saldo_up_pct || 0) < 25
                          ? "bg-red-50 border-red-200 text-red-700"
                          : (summary?.saldo_up_pct || 0) < 50
                            ? "bg-amber-50 border-amber-200 text-amber-700"
                            : "bg-emerald-50 border-emerald-200 text-emerald-700",
                      mono: true,
                    },
                    {
                      label: "GU Status",
                      value: summaryLoading ? "…" : "—",
                      tone: "bg-white border-slate-200 text-slate-900",
                    },
                    {
                      label: "SLA Verif",
                      value: summaryLoading
                        ? "…"
                        : `${summary?.sla_verif || 0}%`,
                      tone: "bg-white border-slate-200 text-slate-900",
                    },
                  ].map((k) => (
                    <div
                      key={k.label}
                      className={`rounded-xl border p-4 shadow-sm ${k.tone}`}
                    >
                      <div
                        className={`text-xl font-extrabold ${k.mono ? "font-mono text-sm" : ""}`}
                      >
                        {k.value}
                      </div>
                      <div className="text-xs mt-1 opacity-80">{k.label}</div>
                    </div>
                  ))}
                </div>

                {active === "inbox" ? (
                  <div className="space-y-6">
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-bold text-slate-900">
                        📥 Inbox Sekretaris
                      </div>
                      <Badge
                        n={summary?.inbox_sekretaris || 0}
                        tone="danger"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mb-3">
                      Tabel ringkas di bawah badge; perintah lengkap, tanggapan, dan outbox ke Sekretaris
                      ada di blok berikut dalam halaman yang sama.
                    </p>
                    {inboxLoading ? (
                      <div className="text-sm text-slate-500 animate-pulse">
                        Memuat…
                      </div>
                    ) : inbox.length === 0 ? (
                      <div className="text-sm text-slate-500 italic">
                        Inbox kosong.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                            <tr>
                              <th className="px-3 py-2 text-left">Judul</th>
                              <th className="px-3 py-2 text-left">Status</th>
                              <th className="px-3 py-2 text-left">Aksi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {inbox.map((t) => (
                              <tr
                                key={t.id}
                                className="border-t border-slate-100"
                              >
                                <td className="px-3 py-2 font-medium text-slate-900">
                                  {t.title || "—"}
                                </td>
                                <td className="px-3 py-2 text-xs text-slate-600">
                                  {t.assignment_status || t.status || "—"}
                                </td>
                                <td className="px-3 py-2">
                                  <button
                                    onClick={() => aksiKonfirmasiInbox(t)}
                                    className="text-xs px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                                  >
                                    Konfirmasi Terima
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                    {coordinationWorkspace}
                  </div>
                ) : active === "komunikasi" ? (
                  <KomunikasiPanel
                    lane={KOM_LANES.ES4_OPERATOR}
                    titleTanggapan="Tanggapan ke atasan (task Anda)"
                    titleDiskusi="Diskusi dengan Kasubag / JF (task)"
                  />
                ) : active === "mod-dpa" ? (
                  <ModulFormPanel modulId="M020" title="DPA — Dokumen Pelaksanaan Anggaran" layout="two-column" showHistory />
                ) : active === "mod-rka" ? (
                  <ModulFormPanel modulId="M021" title="RKA — Rencana Kerja dan Anggaran" layout="two-column" showHistory />
                ) : active === "mod-spj-input" ? (
                  <ModulFormPanel modulId="M022" title="Input SPJ" layout="two-column" showHistory />
                ) : active === "mod-realisasi" ? (
                  <ModulFormPanel modulId="M023" title="Realisasi Anggaran" layout="two-column" showHistory />
                ) : active === "mod-belanja-pegawai" ? (
                  <ModulFormPanel modulId="M024" title="Belanja Pegawai" layout="two-column" showHistory />
                ) : active === "mod-belanja-barang" ? (
                  <ModulFormPanel modulId="M025" title="Belanja Barang" layout="two-column" showHistory />
                ) : active === "mod-belanja-modal" ? (
                  <ModulFormPanel modulId="M026" title="Belanja Modal" layout="two-column" showHistory />
                ) : active === "spj_masuk" ? (
                  <div className="space-y-4">
                    <SpjKonfirmasiWidget compact />
                    <SpjBendaharaAntrian />
                  </div>
                ) : active === "siap_bayar" ? (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-bold text-slate-900">
                        ✅ Siap Dibayar
                      </div>
                      <Badge n={summary?.siap_dibayar || 0} />
                    </div>
                    <div className="text-xs text-slate-500 mb-3">
                      Pembayaran hanya boleh jika status{" "}
                      <span className="font-semibold">disetujui_sekretaris</span>.
                    </div>
                    {spjSiapBayarLoading ? (
                      <div className="text-sm text-slate-500 animate-pulse">
                        Memuat…
                      </div>
                    ) : spjSiapBayar.length === 0 ? (
                      <div className="text-sm text-slate-500 italic">
                        Tidak ada SPJ siap dibayar.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                            <tr>
                              <th className="px-3 py-2 text-left">Nomor</th>
                              <th className="px-3 py-2 text-left">Jenis</th>
                              <th className="px-3 py-2 text-right">Nominal</th>
                              <th className="px-3 py-2 text-left">Aksi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {spjSiapBayar.map((s) => (
                              <tr
                                key={s.id}
                                className="border-t border-slate-100"
                              >
                                <td className="px-3 py-2 font-mono text-xs">
                                  {s.nomor_spj || `SPJ#${s.id}`}
                                </td>
                                <td className="px-3 py-2">{s.jenis_belanja}</td>
                                <td className="px-3 py-2 text-right font-mono text-xs">
                                  {rupiah(s.nominal)}
                                </td>
                                <td className="px-3 py-2">
                                  <button
                                    onClick={() => aksiBayar(s)}
                                    className="text-xs px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                                  >
                                    Proses Pembayaran
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ) : active === "dikembalikan_ppk" ? (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-bold text-slate-900">
                        ↩️ Dikembalikan dari PPK
                      </div>
                      <Badge
                        n={summary?.dikembalikan_ppk || 0}
                        tone="danger"
                      />
                    </div>
                    {spjDikembalikanPpkLoading ? (
                      <div className="text-sm text-slate-500 animate-pulse">
                        Memuat…
                      </div>
                    ) : spjDikembalikanPpk.length === 0 ? (
                      <div className="text-sm text-slate-500 italic">
                        Tidak ada SPJ dikembalikan PPK.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {spjDikembalikanPpk.map((s) => (
                          <div
                            key={s.id}
                            className="rounded-lg border border-amber-200 bg-amber-50 p-3"
                          >
                            <div className="text-sm font-bold text-slate-900">
                              {s.nomor_spj || `SPJ#${s.id}`} • {s.jenis_belanja} •{" "}
                              <span className="font-mono text-xs">
                                {rupiah(s.nominal)}
                              </span>
                            </div>
                            <div className="text-xs text-slate-700 mt-1 whitespace-pre-wrap">
                              Catatan PPK: {s.catatan_ppk || "—"}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1">
                              Bendahara tidak memperbaiki substansi, hanya meneruskan catatan ke Pelaksana.
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                      <div className="font-bold text-slate-900 mb-3">
                        💰 Posisi Kas Hari Ini
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="rounded-lg border border-slate-200 p-4">
                          <div className="text-xs text-slate-500">
                            Saldo UP saat ini
                          </div>
                          <div className="text-lg font-extrabold text-slate-900 font-mono mt-1">
                            {rupiah(summary?.saldo_up || 0)}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1">
                            Dari total UP: {rupiah(summary?.saldo_up_total || 0)}{" "}
                            • {summary?.saldo_up_pct || 0}%
                          </div>
                        </div>
                        <div className="rounded-lg border border-slate-200 p-4">
                          <div className="text-xs text-slate-500">Saran</div>
                          <div className="text-sm font-semibold text-slate-900 mt-1">
                            {(summary?.saldo_up_pct || 0) < 25
                              ? "⚠️ Saldo kritis — siapkan pengajuan GU"
                              : (summary?.saldo_up_pct || 0) < 50
                                ? "Perhatikan saldo — monitor kebutuhan GU"
                                : "Saldo sehat — lanjutkan proses normal"}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1">
                            (MVP) Proyeksi GU akan disempurnakan di modul UP/GU/TUP.
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                      <div className="font-bold text-slate-900 mb-3">
                        ⚙️ Quick actions
                      </div>
                      <div className="text-xs text-slate-600 mb-3">
                        Sistem ini{" "}
                        <span className="font-semibold">tidak menyediakan</span>{" "}
                        tombol untuk membuat SPJ dari Bendahara.
                      </div>
                      <div className="space-y-2">
                        <button
                          onClick={() => setActive("spj_masuk")}
                          className="w-full text-sm px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                        >
                          Buka SPJ Masuk
                        </button>
                        <button
                          onClick={() => setActive("siap_bayar")}
                          className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                        >
                          Buka Siap Dibayar
                        </button>
                        <button
                          onClick={() => setActive("inbox")}
                          className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                        >
                          Buka Inbox Sekretaris
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : isGaji ? (
              <>
                {/* KPI Bendahara Gaji */}
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-5">
                  {[
                    {
                      label: "Inbox Sekretaris",
                      value: summaryLoading ? "…" : summary?.inbox_sekretaris || 0,
                      tone:
                        (summary?.inbox_sekretaris || 0) > 0
                          ? "bg-red-50 border-red-200 text-red-700"
                          : "bg-white border-slate-200 text-slate-900",
                    },
                    {
                      label: "Status Daftar Gaji",
                      value: summaryLoading ? "…" : summary?.status_daftar_gaji || "—",
                      tone: "bg-white border-slate-200 text-slate-900",
                    },
                    {
                      label: "Perubahan Pending",
                      value: summaryLoading
                        ? "…"
                        : summary?.perubahan_kepeg_pending || 0,
                      tone:
                        (summary?.perubahan_kepeg_pending || 0) > 0
                          ? "bg-amber-50 border-amber-200 text-amber-700"
                          : "bg-white border-slate-200 text-slate-900",
                    },
                    {
                      label: "Dikembalikan",
                      value: summaryLoading ? "…" : summary?.dikembalikan || 0,
                      tone:
                        (summary?.dikembalikan || 0) > 0
                          ? "bg-red-50 border-red-200 text-red-700"
                          : "bg-white border-slate-200 text-slate-900",
                    },
                    {
                      label: "SLA Proses",
                      value: summaryLoading ? "…" : `${summary?.sla_proses || 0}%`,
                      tone: "bg-white border-slate-200 text-slate-900",
                    },
                    {
                      label: "Anomali",
                      value: summaryLoading ? "…" : summary?.anomali || 0,
                      tone:
                        (summary?.anomali || 0) > 0
                          ? "bg-red-50 border-red-200 text-red-700"
                          : "bg-white border-slate-200 text-slate-900",
                    },
                  ].map((k) => (
                    <div
                      key={k.label}
                      className={`rounded-xl border p-4 shadow-sm ${k.tone}`}
                    >
                      <div className="text-xl font-extrabold">{k.value}</div>
                      <div className="text-xs mt-1 opacity-80">{k.label}</div>
                    </div>
                  ))}
                </div>

                {active === "inbox" ? (
                  <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-bold text-slate-900">
                          📥 Inbox Sekretaris
                        </div>
                        <Badge n={summary?.inbox_sekretaris || 0} tone="danger" />
                      </div>
                      <p className="text-xs text-slate-500 mb-3">
                        Tabel ringkas; perintah lengkap, tanggapan, dan outbox ke Sekretaris ada di blok
                        berikut.
                      </p>
                      {inboxLoading ? (
                        <div className="text-sm text-slate-500 animate-pulse">Memuat…</div>
                      ) : inbox.length === 0 ? (
                        <div className="text-sm text-slate-500 italic">Inbox kosong.</div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm">
                            <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                              <tr>
                                <th className="px-3 py-2 text-left">Judul</th>
                                <th className="px-3 py-2 text-left">Status</th>
                                <th className="px-3 py-2 text-left">Aksi</th>
                              </tr>
                            </thead>
                            <tbody>
                              {inbox.map((t) => (
                                <tr key={t.id} className="border-t border-slate-100">
                                  <td className="px-3 py-2 font-medium text-slate-900">{t.title || "—"}</td>
                                  <td className="px-3 py-2 text-xs text-slate-600">
                                    {t.assignment_status || t.status || "—"}
                                  </td>
                                  <td className="px-3 py-2">
                                    <button
                                      type="button"
                                      onClick={() => aksiKonfirmasiInbox(t)}
                                      className="text-xs px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                                    >
                                      Konfirmasi Terima
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                    {coordinationWorkspace}
                  </div>
                ) : active === "dikembalikan" ? (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-bold text-slate-900">
                        ↩️ Dikembalikan — Perlu Perbaikan
                      </div>
                      <Badge n={summary?.dikembalikan || 0} tone="danger" />
                    </div>
                    {dgDikembalikanLoading ? (
                      <div className="text-sm text-slate-500 animate-pulse">
                        Memuat…
                      </div>
                    ) : dgDikembalikan.length === 0 ? (
                      <div className="text-sm text-slate-500 italic">
                        Tidak ada dokumen dikembalikan.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {dgDikembalikan.map((r) => (
                          <div
                            key={r.id}
                            className="rounded-lg border border-red-200 bg-red-50 p-3"
                          >
                            <div className="text-sm font-bold text-slate-900">
                              {r.nomor_daftar_gaji || `DG#${r.id}`} •{" "}
                              {String(r.periode_bulan).padStart(2, "0")}/{r.periode_tahun}
                              {r.revisi_ke ? (
                                <span className="ml-2 text-[11px] px-2 py-0.5 rounded-full bg-white/70 border border-red-200 text-red-700 font-bold">
                                  revisi {r.revisi_ke}
                                </span>
                              ) : null}
                            </div>
                            <div className="text-xs text-slate-700 mt-1 whitespace-pre-wrap">
                              Catatan: {r.catatan_jf_keuangan || r.catatan_sekretaris || "—"}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : active === "perubahan" ? (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                    <div className="font-bold text-slate-900 mb-2">
                      ⚠️ Perubahan Kepegawaian Pending
                    </div>
                    <div className="text-sm text-slate-600">
                      (MVP) Panel ini akan diisi dari log sinkronisasi perubahan data ASN oleh Kasubag.
                      Saat ini indikatornya masih placeholder.
                    </div>
                  </div>
                ) : active === "daftar_gaji" ? (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-bold text-slate-900">
                        📋 Daftar Gaji Bulanan
                      </div>
                      <button
                        onClick={async () => {
                          await api.post(`${baseUrl}/daftar-gaji/buat-bulan-ini`);
                          await refreshAll();
                        }}
                        className="text-xs px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                      >
                        Buat/Siapkan Bulan Ini
                      </button>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 mb-4">
                      <div className="text-xs text-slate-500">Bulan ini</div>
                      {dgBulanIniLoading ? (
                        <div className="text-sm text-slate-600 animate-pulse">Memuat…</div>
                      ) : !dgBulanIni ? (
                        <div className="text-sm text-slate-600 italic">
                          Belum ada draft daftar gaji bulan ini.
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="text-sm font-bold text-slate-900">
                              {dgBulanIni.nomor_daftar_gaji || `DG#${dgBulanIni.id}`} •{" "}
                              {String(dgBulanIni.periode_bulan).padStart(2, "0")}/{dgBulanIni.periode_tahun}
                            </div>
                            <div className="text-xs text-slate-600 mt-1">
                              Status:{" "}
                              <span className="font-semibold">{dgBulanIni.status}</span>{" "}
                              • Total bersih:{" "}
                              <span className="font-mono">{rupiah(dgBulanIni.total_gaji_bersih)}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            <button
                              onClick={async () => {
                                await api.post(`${baseUrl}/daftar-gaji/${dgBulanIni.id}/submit-ppk`);
                                await refreshAll();
                              }}
                              className="text-xs px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                            >
                              Submit ke JF Keuangan/PPK
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {dgLoading ? (
                      <div className="text-sm text-slate-500 animate-pulse">
                        Memuat arsip…
                      </div>
                    ) : dgRows.length === 0 ? (
                      <div className="text-sm text-slate-500 italic">
                        Belum ada arsip daftar gaji.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                            <tr>
                              <th className="px-3 py-2 text-left">Nomor</th>
                              <th className="px-3 py-2 text-left">Periode</th>
                              <th className="px-3 py-2 text-right">Total Bersih</th>
                              <th className="px-3 py-2 text-left">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dgRows.map((r) => (
                              <tr key={r.id} className="border-t border-slate-100">
                                <td className="px-3 py-2 font-mono text-xs">
                                  {r.nomor_daftar_gaji || `DG#${r.id}`}
                                </td>
                                <td className="px-3 py-2 text-xs text-slate-700">
                                  {String(r.periode_bulan).padStart(2, "0")}/{r.periode_tahun}
                                </td>
                                <td className="px-3 py-2 text-right font-mono text-xs">
                                  {rupiah(r.total_gaji_bersih)}
                                </td>
                                <td className="px-3 py-2 text-xs text-slate-700">
                                  {r.status}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                    <div className="font-bold text-slate-900 mb-2">
                      📅 Proses Penggajian — Bulan Ini
                    </div>
                    <div className="text-sm text-slate-600">
                      Status saat ini:{" "}
                      <span className="font-semibold">
                        {summary?.status_daftar_gaji || "—"}
                      </span>
                      .
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                      (MVP) Timeline 5 tahap + sinkronisasi perubahan ASN akan disempurnakan di iterasi berikut.
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* KPI Bendahara Barang */}
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-5">
                  {[
                    {
                      label: "Inbox Sekretaris",
                      value: summaryLoading ? "…" : summary?.inbox_sekretaris || 0,
                      tone:
                        (summary?.inbox_sekretaris || 0) > 0
                          ? "bg-red-50 border-red-200 text-red-700"
                          : "bg-white border-slate-200 text-slate-900",
                    },
                    {
                      label: "Penerimaan Pending",
                      value: summaryLoading ? "…" : summary?.penerimaan_pending || 0,
                      tone:
                        (summary?.penerimaan_pending || 0) > 0
                          ? "bg-amber-50 border-amber-200 text-amber-700"
                          : "bg-white border-slate-200 text-slate-900",
                    },
                    {
                      label: "Aset Kritis",
                      value: summaryLoading ? "…" : summary?.aset_kritis || 0,
                      tone:
                        (summary?.aset_kritis || 0) > 0
                          ? "bg-red-50 border-red-200 text-red-700"
                          : "bg-white border-slate-200 text-slate-900",
                    },
                    {
                      label: "Jadwal Pemeliharaan",
                      value: summaryLoading ? "…" : summary?.jadwal_pemeliharaan || 0,
                      tone: "bg-white border-slate-200 text-slate-900",
                    },
                    {
                      label: "Kerusakan Masuk",
                      value: summaryLoading ? "…" : summary?.kerusakan_masuk || 0,
                      tone:
                        (summary?.kerusakan_masuk || 0) > 0
                          ? "bg-amber-50 border-amber-200 text-amber-700"
                          : "bg-white border-slate-200 text-slate-900",
                    },
                    {
                      label: "SLA Penerimaan",
                      value: summaryLoading ? "…" : `${summary?.sla_penerimaan || 0}%`,
                      tone: "bg-white border-slate-200 text-slate-900",
                    },
                  ].map((k) => (
                    <div
                      key={k.label}
                      className={`rounded-xl border p-4 shadow-sm ${k.tone}`}
                    >
                      <div className="text-xl font-extrabold">{k.value}</div>
                      <div className="text-xs mt-1 opacity-80">{k.label}</div>
                    </div>
                  ))}
                </div>

                {active === "inbox" ? (
                  <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-bold text-slate-900">
                          📥 Inbox Sekretaris
                        </div>
                        <Badge n={summary?.inbox_sekretaris || 0} tone="danger" />
                      </div>
                      <p className="text-xs text-slate-500 mb-3">
                        Tabel ringkas; perintah lengkap, tanggapan, dan outbox ke Sekretaris ada di blok
                        berikut.
                      </p>
                      {inboxLoading ? (
                        <div className="text-sm text-slate-500 animate-pulse">Memuat…</div>
                      ) : inbox.length === 0 ? (
                        <div className="text-sm text-slate-500 italic">Inbox kosong.</div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm">
                            <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                              <tr>
                                <th className="px-3 py-2 text-left">Judul</th>
                                <th className="px-3 py-2 text-left">Status</th>
                                <th className="px-3 py-2 text-left">Aksi</th>
                              </tr>
                            </thead>
                            <tbody>
                              {inbox.map((t) => (
                                <tr key={t.id} className="border-t border-slate-100">
                                  <td className="px-3 py-2 font-medium text-slate-900">{t.title || "—"}</td>
                                  <td className="px-3 py-2 text-xs text-slate-600">
                                    {t.assignment_status || t.status || "—"}
                                  </td>
                                  <td className="px-3 py-2">
                                    <button
                                      type="button"
                                      onClick={() => aksiKonfirmasiInbox(t)}
                                      className="text-xs px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                                    >
                                      Konfirmasi Terima
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                    {coordinationWorkspace}
                  </div>
                ) : active === "penerimaan" ? (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-bold text-slate-900">
                        📦 Penerimaan Barang Pending
                      </div>
                      <Badge n={summary?.penerimaan_pending || 0} tone="warn" />
                    </div>
                    {bbPenerimaanPendingLoading ? (
                      <div className="text-sm text-slate-500 animate-pulse">Memuat…</div>
                    ) : bbPenerimaanPending.length === 0 ? (
                      <div className="text-sm text-slate-500 italic">Tidak ada penerimaan pending.</div>
                    ) : (
                      <div className="space-y-2">
                        {bbPenerimaanPending.map((p) => (
                          <div key={p.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <div className="text-sm font-bold text-slate-900">
                              {p.nama_pengadaan} • {rupiah(p.nilai_kontrak)}
                            </div>
                            <div className="text-xs text-slate-600 mt-1">
                              Rekanan: {p.nama_rekanan} • Status: {p.status}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : active === "dikembalikan_ppk" ? (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-bold text-slate-900">
                        ↩️ Dikembalikan PPK
                      </div>
                      <Badge n={summary?.dikembalikan_ppk || 0} tone="danger" />
                    </div>
                    {bbDikembalikanPpkLoading ? (
                      <div className="text-sm text-slate-500 animate-pulse">Memuat…</div>
                    ) : bbDikembalikanPpk.length === 0 ? (
                      <div className="text-sm text-slate-500 italic">Tidak ada dikembalikan PPK.</div>
                    ) : (
                      <div className="space-y-2">
                        {bbDikembalikanPpk.map((p) => (
                          <div key={p.id} className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                            <div className="text-sm font-bold text-slate-900">
                              {p.nama_pengadaan} • {rupiah(p.nilai_kontrak)}
                            </div>
                            <div className="text-xs text-slate-700 mt-1 whitespace-pre-wrap">
                              Catatan PPK: {p.catatan_ppk || "—"}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : active === "pemeliharaan" ? (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-bold text-slate-900">
                        🔧 Jadwal Pemeliharaan 30 Hari
                      </div>
                      <Badge n={summary?.jadwal_pemeliharaan || 0} />
                    </div>
                    {bbPemeliharaanLoading ? (
                      <div className="text-sm text-slate-500 animate-pulse">Memuat…</div>
                    ) : bbPemeliharaan.length === 0 ? (
                      <div className="text-sm text-slate-500 italic">Tidak ada jadwal mendatang.</div>
                    ) : (
                      <div className="space-y-2">
                        {bbPemeliharaan.map((r) => (
                          <div key={r.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <div className="text-sm font-bold text-slate-900">
                              {r.tanggal_jadwal} • {r.jenis_pemeliharaan}
                            </div>
                            <div className="text-xs text-slate-600 mt-1">
                              {r.deskripsi} • Estimasi: {rupiah(r.biaya_estimasi)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : active === "kerusakan" ? (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-bold text-slate-900">
                        ❌ Laporan Kerusakan Masuk
                      </div>
                      <Badge n={summary?.kerusakan_masuk || 0} tone="warn" />
                    </div>
                    {bbKerusakanMasukLoading ? (
                      <div className="text-sm text-slate-500 animate-pulse">Memuat…</div>
                    ) : bbKerusakanMasuk.length === 0 ? (
                      <div className="text-sm text-slate-500 italic">Tidak ada laporan masuk.</div>
                    ) : (
                      <div className="space-y-2">
                        {bbKerusakanMasuk.map((k) => (
                          <div key={k.id} className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                            <div className="text-sm font-bold text-slate-900">
                              {k.nama_aset} • {k.lokasi_aset}
                            </div>
                            <div className="text-xs text-slate-700 mt-1 whitespace-pre-wrap">
                              {k.deskripsi}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1">
                              Urgensi: {k.tingkat_urgensi} • Status: {k.status_tindak_lanjut}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : active === "aset_kritis" ? (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-bold text-slate-900">
                        🚨 Aset Kondisi Kritis
                      </div>
                      <Badge n={summary?.aset_kritis || 0} tone="danger" />
                    </div>
                    <div className="text-xs text-slate-500 mb-3">
                      Ringkasan:{" "}
                      {bbAsetSummaryLoading ? "…" : `${bbAsetSummary?.total || 0} total aset`}
                      {bbAsetSummary ? (
                        <span className="ml-2">
                          (baik: {bbAsetSummary.baik || 0}, rusak ringan: {bbAsetSummary.rusak_ringan || 0}, rusak berat: {bbAsetSummary.rusak_berat || 0})
                        </span>
                      ) : null}
                    </div>
                    {bbAsetKritisLoading ? (
                      <div className="text-sm text-slate-500 animate-pulse">Memuat…</div>
                    ) : bbAsetKritis.length === 0 ? (
                      <div className="text-sm text-slate-500 italic">Tidak ada aset kritis.</div>
                    ) : (
                      <div className="space-y-2">
                        {bbAsetKritis.map((a) => (
                          <div key={a.id} className="rounded-lg border border-red-200 bg-red-50 p-3">
                            <div className="text-sm font-bold text-slate-900">
                              {a.nomor_register} • {a.nama_barang}
                            </div>
                            <div className="text-xs text-slate-700 mt-1">
                              Kondisi: {a.kondisi} • Lokasi: {a.lokasi_fisik || "—"} • Unit: {a.unit_kerja}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                      <div className="font-bold text-slate-900 mb-3">
                        📦 Ringkasan Inventaris & Penerimaan
                      </div>
                      <div className="text-sm text-slate-700">
                        Total aset:{" "}
                        <span className="font-semibold">
                          {bbAsetSummary?.total ?? "—"}
                        </span>{" "}
                        • Aset kritis:{" "}
                        <span className="font-semibold">
                          {summary?.aset_kritis ?? "—"}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-2">
                        (MVP) Modul detail inventaris + BAST digital lengkap akan disempurnakan berikutnya.
                      </div>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                      <div className="font-bold text-slate-900 mb-3">
                        ⚙️ Quick actions
                      </div>
                      <div className="space-y-2">
                        <button
                          onClick={() => setActive("penerimaan")}
                          className="w-full text-sm px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                        >
                          Buka Penerimaan Pending
                        </button>
                        <button
                          onClick={() => setActive("aset_kritis")}
                          className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                        >
                          Buka Aset Kritis
                        </button>
                        <button
                          onClick={() => setActive("kerusakan")}
                          className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                        >
                          Buka Laporan Kerusakan
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
