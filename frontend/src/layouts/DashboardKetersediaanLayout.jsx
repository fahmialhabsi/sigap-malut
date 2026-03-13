import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { roleIdToName } from "../utils/roleMap";

function normalizeRoleName(user) {
  return (
    (user?.roleName && String(user.roleName).toLowerCase()) ||
    user?.role ||
    roleIdToName?.[user?.role_id] ||
    roleIdToName?.[String(user?.role_id)] ||
    null
  );
}

function getModuleCanonicalName(moduleRow) {
  return moduleRow?.nama_modul || moduleRow?.name || moduleRow?.id || "";
}

const KEBIJAKAN_STORAGE_KEY = "ketersediaan_kebijakan_analisis_records";

export default function DashboardKetersediaanLayout({ fallbackModules = [] }) {
  const navigate = useNavigate();
  // State
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 768;
  });
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.innerWidth >= 768;
  });
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [modules, setModules] = useState(fallbackModules || []);
  const [menuAktif, setMenuAktif] = useState("");
  const [user, setUser] = useState(null);
  const [tableRows, setTableRows] = useState([]);
  const [kpi, setKpi] = useState([]);
  const [chart, setChart] = useState({ labels: [], datasets: [] });
  const [notifikasi, setNotifikasi] = useState([]);
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [kebijakanForm, setKebijakanForm] = useState(() => ({
    tanggal: new Date().toISOString().slice(0, 10),
    komoditas: "",
    wilayah: "",
    stokTon: "",
    kebutuhanTon: "",
    rekomendasi: "",
    status: "Draft",
  }));
  const [kebijakanRows, setKebijakanRows] = useState([]);
  const [kebijakanSaved, setKebijakanSaved] = useState(false);

  // Keep sidebar behavior consistent between desktop and mobile.
  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Ambil info user & role dari backend
  useEffect(() => {
    let mounted = true;

    api
      .get("/auth/me")
      .then((res) => {
        if (!mounted) return;

        const data = res.data?.data;
        setUser(data);
        setAuthChecked(true);

        const normalized = normalizeRoleName(data);
        const jabatan = data?.jabatan ? String(data.jabatan).toLowerCase() : "";
        const unitKerja = data?.unit_kerja
          ? String(data.unit_kerja).toLowerCase()
          : "";

        // Ketersediaan allowed:
        // - kepala_bidang_ketersediaan
        // - super_admin
        // - kepala_dinas / gubernur optionally
        const isKetersediaan =
          normalized === "kepala_bidang_ketersediaan" ||
          normalized === "super_admin" ||
          normalized === "kepala_dinas" ||
          normalized === "gubernur" ||
          unitKerja === "bidang ketersediaan" ||
          jabatan.includes("kepala bidang") ||
          jabatan.includes("ketersediaan");

        if (!data || !isKetersediaan) {
          window.location.href = "/";
        }
      })
      .catch(() => {
        if (!mounted) return;
        setAuthChecked(true);
        window.location.href = "/";
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Ambil modul sidebar bidang ketersediaan (tolerant + fallback statis)
  useEffect(() => {
    if (!authChecked) return;
    let mounted = true;

    const loadFromStaticModules = () => {
      if (Array.isArray(fallbackModules) && fallbackModules.length) {
        applyModules(fallbackModules);
        return;
      }

      fetch("/master-data/modules-ketersediaan.json")
        .then((response) => response.json())
        .then((json) => applyModules(json))
        .catch(() => applyModules([]));
    };

    const syncSelectedMenu = (nextModules) => {
      setMenuAktif((current) => {
        if (!current) return "";
        const exists = nextModules.some(
          (row) => getModuleCanonicalName(row) === current,
        );
        return exists ? current : "";
      });
    };

    // helper: set modules safely
    const applyModules = (arr) => {
      if (!mounted) return;
      if (arr && arr.length) {
        const ketersediaan = arr.filter((row) => {
          const bidang = String(
            row.bidang ||
              row.bidang_name ||
              row.bidangLabel ||
              row.department ||
              "",
          )
            .trim()
            .toLowerCase();
          const moduleId = String(row.modul_id || row.id || "")
            .trim()
            .toUpperCase();
          const isActive =
            row?.is_active === undefined ||
            row?.is_active === null ||
            row?.is_active === true ||
            String(row?.is_active).toLowerCase() === "true" ||
            String(row?.is_active) === "1";
          return (
            isActive &&
            (bidang.includes("ketersediaan") || moduleId.startsWith("BKT-"))
          );
        });

        if (ketersediaan && ketersediaan.length) {
          const sorted = [...ketersediaan].sort((a, b) => {
            const orderA = Number(a?.menu_order ?? a?.menuOrder ?? 9999);
            const orderB = Number(b?.menu_order ?? b?.menuOrder ?? 9999);
            return orderA - orderB;
          });

          setModules(sorted);
          syncSelectedMenu(sorted);
          return;
        }

        // fallback: use arr if no bidang match
        setModules(arr);
        syncSelectedMenu(arr);
        return;
      }

      if (Array.isArray(fallbackModules) && fallbackModules.length) {
        setModules(fallbackModules);
        syncSelectedMenu(fallbackModules);
        return;
      }

      setModules([]);
      setMenuAktif("");
    };

    loadFromStaticModules();

    return () => {
      mounted = false;
    };
  }, [authChecked, fallbackModules, user]);

  const activeModule = useMemo(
    () =>
      modules.find(
        (mod) => mod.nama_modul === menuAktif || mod.name === menuAktif,
      ) || null,
    [menuAktif, modules],
  );

  const isKebijakanAnalisisMenu = useMemo(() => {
    const moduleId = String(activeModule?.modul_id || activeModule?.id || "")
      .trim()
      .toUpperCase();
    const moduleName = String(
      activeModule?.nama_modul || activeModule?.name || menuAktif || "",
    )
      .trim()
      .toLowerCase();

    return (
      moduleId === "BKT-KBJ" ||
      (moduleName.includes("kebijakan") && moduleName.includes("ketersediaan"))
    );
  }, [activeModule, menuAktif]);

  useEffect(() => {
    try {
      const savedRows = JSON.parse(
        localStorage.getItem(KEBIJAKAN_STORAGE_KEY) || "[]",
      );
      setKebijakanRows(Array.isArray(savedRows) ? savedRows : []);
    } catch {
      setKebijakanRows([]);
    }
  }, []);

  // Data fetch for active module (table, chart, kpi, notifications)
  useEffect(() => {
    if (!activeModule) return;

    setTableRows([]);
    setKpi([]);
    setChart({ labels: [], datasets: [] });
    setNotifikasi([]);
    setLoading(false);
  }, [activeModule, isKebijakanAnalisisMenu]);

  // Avatar logic
  const avatarRef = useRef();
  useEffect(() => {
    const handleClick = (e) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target))
        setAvatarOpen(false);
    };
    if (avatarOpen) window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [avatarOpen]);

  // Waktu real-time
  const [waktu, setWaktu] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setWaktu(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: "#134e4a66" }, ticks: { color: "#e6fffa" } },
      y: { grid: { color: "#134e4a44" }, ticks: { color: "#e6fffa" } },
    },
  };

  const kpiShown = !activeModule
    ? [
        {
          title: "Total Modul",
          value: modules.length,
          color: "green",
        },
        {
          title: "Modul Aktif",
          value: modules.filter((row) => row?.is_active !== false).length,
          color: "blue",
        },
        {
          title: "Status Dashboard",
          value: "Siap",
          color: "yellow",
        },
      ]
    : isKebijakanAnalisisMenu
      ? [
          {
            title: "Total Dokumen Kebijakan",
            value: kebijakanRows.length,
            color: "green",
          },
          {
            title: "Status Final",
            value: kebijakanRows.filter((row) => row.status === "Final").length,
            color: "blue",
          },
          {
            title: "Perlu Review",
            value: kebijakanRows.filter((row) => row.status !== "Final").length,
            color: "yellow",
          },
        ]
      : kpi;

  const handleKebijakanFormChange = (field, value) => {
    setKebijakanForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleKebijakanSubmit = (e) => {
    e.preventDefault();

    if (
      !kebijakanForm.tanggal ||
      !kebijakanForm.komoditas ||
      !kebijakanForm.wilayah
    ) {
      window.alert("Tanggal, Komoditas, dan Wilayah wajib diisi.");
      return;
    }

    const stokTon = Number(kebijakanForm.stokTon || 0);
    const kebutuhanTon = Number(kebijakanForm.kebutuhanTon || 0);

    const newRow = {
      id: `${Date.now()}`,
      tanggal: kebijakanForm.tanggal,
      komoditas: kebijakanForm.komoditas,
      wilayah: kebijakanForm.wilayah,
      stokTon,
      kebutuhanTon,
      selisihTon: stokTon - kebutuhanTon,
      status: kebijakanForm.status,
      rekomendasi: kebijakanForm.rekomendasi,
      dibuatPada: Date.now(),
    };

    setKebijakanRows((prev) => {
      const nextRows = [newRow, ...prev];
      localStorage.setItem(KEBIJAKAN_STORAGE_KEY, JSON.stringify(nextRows));
      return nextRows;
    });

    setKebijakanForm({
      tanggal: new Date().toISOString().slice(0, 10),
      komoditas: "",
      wilayah: "",
      stokTon: "",
      kebutuhanTon: "",
      rekomendasi: "",
      status: "Draft",
    });

    setKebijakanSaved(true);
    setTimeout(() => setKebijakanSaved(false), 1800);
  };

  const handleDeleteKebijakanRow = (rowId) => {
    setKebijakanRows((prev) => {
      const nextRows = prev.filter((row) => row.id !== rowId);
      localStorage.setItem(KEBIJAKAN_STORAGE_KEY, JSON.stringify(nextRows));
      return nextRows;
    });
  };

  return (
    <div className="fixed inset-0 flex font-inter bg-gradient-to-br from-green-900 via-green-800 to-slate-800 text-slate-100 select-none">
      {isMobile && sidebarOpen && (
        <button
          type="button"
          aria-label="Tutup sidebar"
          className="fixed inset-0 z-20 bg-slate-950/45"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`h-full bg-green-950/95 z-30 flex flex-col items-center flex-shrink-0
        transition-all duration-300 ${
          isMobile
            ? `${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed left-0 top-0 w-[275px] min-w-[275px]`
            : sidebarOpen
              ? "w-[275px] min-w-[275px]"
              : "w-[72px] min-w-[72px]"
        } 
        border-r border-green-900/60 shadow-xl`}
      >
        <div className="flex items-center justify-center w-full py-8">
          <img
            src="/Logo.png"
            alt="logo"
            className={`object-contain ${sidebarOpen ? "w-24 h-24" : "w-10 h-10"}`}
          />
        </div>
        <nav className="w-full flex flex-col gap-4 flex-1 justify-center px-3">
          {Array.isArray(modules) && modules.length ? (
            modules.map((modul) => {
              const label = modul.nama_modul || modul.name || modul.id || "-";
              const key = modul.modul_id || modul.id || label;
              const canonical = modul.nama_modul || modul.name || label;
              return (
                <SidebarItem
                  key={key}
                  label={label}
                  active={menuAktif === canonical}
                  sidebarOpen={sidebarOpen}
                  onClick={() => {
                    const modulePathId = String(
                      modul.modul_id || modul.id || "",
                    )
                      .trim()
                      .toLowerCase();
                    setMenuAktif(canonical);
                    if (isMobile) setSidebarOpen(false);

                    if (!modulePathId) return;

                    navigate(`/module/${modulePathId}`);
                  }}
                />
              );
            })
          ) : (
            <div className="px-2 py-4 text-center text-sm text-green-100/70">
              {sidebarOpen ? "Menu belum tersedia" : "-"}
            </div>
          )}
        </nav>
        <div className="py-6 w-full text-xs text-green-100/70 text-center tracking-wide">
          {sidebarOpen ? "SIGAP Malut" : "SIGAP"}
        </div>
      </aside>

      <div className="flex-1 min-w-0 min-h-0 h-full flex flex-col bg-green-950/80 backdrop-blur">
        <header className="flex-none w-full h-[75px] bg-green-900/80 flex items-center px-4 md:px-12 shadow-sm z-10 sticky top-0">
          <button
            type="button"
            className="mr-3 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-green-700/70 bg-green-950/60 text-green-100 hover:bg-green-800/70"
            onClick={() => setSidebarOpen((open) => !open)}
            aria-label={sidebarOpen ? "Tutup sidebar" : "Buka sidebar"}
          >
            <span className="text-base font-bold">
              {sidebarOpen ? "<" : "="}
            </span>
          </button>
          <div className="text-lg md:text-2xl text-white font-bold tracking-wide flex-1">
            SIGAP <span className="font-light">·</span> Bidang Ketersediaan
          </div>
          <div className="mr-8 hidden md:block font-mono text-sm blur-none select-text opacity-75">
            {waktu.toLocaleString("id-ID", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </div>
          <div className="mr-5 hidden md:block text-xs text-green-100/70">
            {user?.email || ""}
          </div>
          <div className="relative mr-5">
            <NotificationBell />
            {notifikasi.length > 0 && (
              <span className="absolute -top-1 -right-1 rounded-full w-4 h-4 bg-red-500 flex items-center justify-center text-xs text-white animate-bounce">
                !
              </span>
            )}
          </div>
          <div className="relative" ref={avatarRef}>
            <button onClick={() => setAvatarOpen(!avatarOpen)}>
              <ProfileAvatar
                userName={user?.nama_lengkap || user?.name || "User"}
              />
            </button>
            {avatarOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-slate-900/95 rounded-xl shadow-lg border border-green-950 p-3 flex flex-col text-sm animate-fade-in-up">
                <div className="font-bold mb-2">
                  {user?.nama_lengkap || user?.name || "Pengguna"}
                </div>
                <div className="mb-2 text-green-200 text-xs">
                  {user?.unit_kerja || user?.unit_id || ""}
                </div>
                <button className="py-1 w-full rounded text-left hover:bg-green-800/60 px-2">
                  Profil Saya
                </button>
                <button className="py-1 w-full rounded text-left hover:bg-green-800/60 px-2">
                  Pengaturan
                </button>
                <button
                  className="py-1 w-full rounded text-left hover:bg-green-800/60 px-2 text-red-400"
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("refreshToken");
                    localStorage.removeItem("user");
                    window.location.href = "/";
                  }}
                >
                  Keluar
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 min-h-0 min-w-0 flex flex-col gap-9 py-8 overflow-auto bg-transparent">
          {loading && (
            <div className="w-full text-center py-6">
              <span className="text-green-200 font-bold text-lg">
                Memuat Data...
              </span>
            </div>
          )}

          <div className="w-full max-w-7xl mx-auto flex flex-row flex-wrap gap-x-8 gap-y-4 items-stretch justify-between px-2">
            {kpiShown.map((item, idx) => (
              <KpiCard
                key={idx}
                title={item.title}
                value={item.value}
                color={item.color}
              />
            ))}
          </div>

          {!activeModule ? (
            <div className="w-full max-w-7xl mx-auto px-2">
              <PanelBox title="Pilih Modul Ketersediaan">
                <div className="space-y-3 text-green-100">
                  <p>
                    Dashboard ini sekarang berfungsi sebagai pintu masuk modul.
                    Pilih salah satu modul di sidebar untuk membuka halaman
                    list.
                  </p>
                  <p className="text-sm text-green-200/90">
                    Dari halaman modul, Anda bisa lanjut ke Input, View, Edit,
                    dan Delete seperti alur Sekretariat.
                  </p>
                </div>
              </PanelBox>
            </div>
          ) : isKebijakanAnalisisMenu ? (
            <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-9 px-2">
              <PanelBox title="Form Kebijakan & Analisis Ketersediaan">
                <form onSubmit={handleKebijakanSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      label="Tanggal"
                      type="date"
                      value={kebijakanForm.tanggal}
                      onChange={(e) =>
                        handleKebijakanFormChange("tanggal", e.target.value)
                      }
                    />
                    <FormInput
                      label="Komoditas"
                      value={kebijakanForm.komoditas}
                      placeholder="Contoh: Beras"
                      onChange={(e) =>
                        handleKebijakanFormChange("komoditas", e.target.value)
                      }
                    />
                    <FormInput
                      label="Wilayah"
                      value={kebijakanForm.wilayah}
                      placeholder="Contoh: Halmahera Barat"
                      onChange={(e) =>
                        handleKebijakanFormChange("wilayah", e.target.value)
                      }
                    />
                    <div>
                      <label className="text-xs text-green-200 mb-1 block">
                        Status Dokumen
                      </label>
                      <select
                        className="w-full rounded-lg border border-green-700/60 bg-green-950/50 px-3 py-2 text-green-50"
                        value={kebijakanForm.status}
                        onChange={(e) =>
                          handleKebijakanFormChange("status", e.target.value)
                        }
                      >
                        <option value="Draft">Draft</option>
                        <option value="Review">Review</option>
                        <option value="Final">Final</option>
                      </select>
                    </div>
                    <FormInput
                      label="Stok (Ton)"
                      type="number"
                      value={kebijakanForm.stokTon}
                      placeholder="0"
                      onChange={(e) =>
                        handleKebijakanFormChange("stokTon", e.target.value)
                      }
                    />
                    <FormInput
                      label="Kebutuhan (Ton)"
                      type="number"
                      value={kebijakanForm.kebutuhanTon}
                      placeholder="0"
                      onChange={(e) =>
                        handleKebijakanFormChange(
                          "kebutuhanTon",
                          e.target.value,
                        )
                      }
                    />
                  </div>

                  <div>
                    <label className="text-xs text-green-200 mb-1 block">
                      Rekomendasi Kebijakan
                    </label>
                    <textarea
                      className="w-full rounded-lg border border-green-700/60 bg-green-950/50 px-3 py-2 text-green-50 min-h-24"
                      placeholder="Tuliskan rekomendasi kebijakan berdasarkan analisis ketersediaan..."
                      value={kebijakanForm.rekomendasi}
                      onChange={(e) =>
                        handleKebijakanFormChange("rekomendasi", e.target.value)
                      }
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-yellow-400 text-slate-900 font-semibold hover:bg-yellow-300"
                    >
                      Simpan Data Kebijakan
                    </button>
                    {kebijakanSaved && (
                      <span className="text-sm text-green-200">
                        Data berhasil disimpan.
                      </span>
                    )}
                  </div>
                </form>
              </PanelBox>

              <PanelBox title="List Kebijakan & Analisis">
                {kebijakanRows.length ? (
                  <div className="overflow-auto max-h-[360px]">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-green-300">
                          <th className="text-left py-2 pr-3">Tanggal</th>
                          <th className="text-left py-2 pr-3">Komoditas</th>
                          <th className="text-left py-2 pr-3">Wilayah</th>
                          <th className="text-left py-2 pr-3">Selisih</th>
                          <th className="text-left py-2 pr-3">Status</th>
                          <th className="text-left py-2 pr-0">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {kebijakanRows.map((row) => (
                          <tr
                            key={row.id}
                            className="border-t border-green-900/60 text-green-100"
                          >
                            <td className="py-2 pr-3">{row.tanggal}</td>
                            <td className="py-2 pr-3">{row.komoditas}</td>
                            <td className="py-2 pr-3">{row.wilayah}</td>
                            <td
                              className={`py-2 pr-3 font-semibold ${
                                Number(row.selisihTon) >= 0
                                  ? "text-green-300"
                                  : "text-red-300"
                              }`}
                            >
                              {Number(row.selisihTon).toLocaleString("id-ID")}{" "}
                              ton
                            </td>
                            <td className="py-2 pr-3">{row.status}</td>
                            <td className="py-2 pr-0">
                              <button
                                type="button"
                                className="px-2 py-1 rounded bg-red-900/70 text-red-100 hover:bg-red-800/80"
                                onClick={() => handleDeleteKebijakanRow(row.id)}
                              >
                                Hapus
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-green-100 text-sm">
                    Belum ada data kebijakan. Isi form di panel kiri untuk
                    menambahkan data.
                  </div>
                )}
              </PanelBox>
            </div>
          ) : (
            <div className="w-full max-w-7xl mx-auto px-2">
              <PanelBox title={menuAktif || "Modul Ketersediaan"}>
                <div className="space-y-4 text-green-100">
                  <p>
                    Anda akan diarahkan ke halaman list modul untuk mengelola
                    data secara penuh.
                  </p>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-lg bg-yellow-400 px-4 py-2 font-semibold text-slate-900 hover:bg-yellow-300"
                    onClick={() =>
                      navigate(
                        `/module/${String(activeModule?.modul_id || activeModule?.id || "").toLowerCase()}`,
                      )
                    }
                  >
                    Buka Halaman Modul
                  </button>
                </div>
              </PanelBox>
            </div>
          )}

          {Array.isArray(notifikasi) && notifikasi.length > 0 && (
            <div className="w-full max-w-7xl mx-auto px-2">
              <PanelBox title="Notifikasi Kritis">
                <ul className="space-y-2 text-sm">
                  {notifikasi.map((n, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2 text-yellow-300"
                    >
                      <span className="text-lg">{n.icon ?? "⚠️"}</span>
                      {n.message || n.text || ""}
                    </li>
                  ))}
                </ul>
              </PanelBox>
            </div>
          )}
        </main>

        <footer className="flex-none h-10 flex items-center text-xs justify-between px-10 w-full bg-gradient-to-r from-green-900 to-green-800/70 text-green-100/80">
          <span>SIGAP Malut</span>
          <span>SIGAP Malut v1 | Bidang Ketersediaan</span>
        </footer>
      </div>
    </div>
  );
}

/* ---------- Helper components (SidebarItem, KpiCard, PanelBox, DataTable, DynamicForm, NotificationBell, ProfileAvatar, styles) ---------- */

function SidebarItem({ label, active, sidebarOpen, badge, onClick }) {
  return (
    <div className="relative w-full flex items-center group transition">
      {active && (
        <div className="absolute left-2 h-[52px] w-2 bg-gradient-to-b from-yellow-400 to-yellow-200 rounded-r-lg scale-105 shadow-lg transition"></div>
      )}
      <button
        className={`
          h-[52px] w-full pl-10 pr-5 text-lg flex items-center rounded-2xl font-semibold
          ${active ? "bg-green-800/90 text-yellow-300" : "bg-green-700/85 text-green-100 hover:bg-green-800/85"}
          shadow group-hover:scale-105
          transition-all
          relative
        `}
        onClick={onClick}
      >
        <span className="flex-1 text-left">
          {sidebarOpen ? label : label[0]}
        </span>
        {badge && (
          <span className="ml-2 w-6 h-6 text-[13px] bg-red-500 text-white rounded-full flex items-center justify-center border-2 border-green-900 animate-pulse">
            {badge}
          </span>
        )}
      </button>
    </div>
  );
}

function KpiCard({ title, value, color }) {
  let bg, border, txt, shadow;
  switch (color) {
    case "green":
      bg =
        "bg-gradient-to-t from-green-900/80 to-green-700/60 backdrop-blur-md";
      border = "border-green-700";
      txt = "text-green-100";
      shadow = "shadow-green-800/10";
      break;
    case "blue":
      bg = "bg-gradient-to-t from-blue-900/80 to-blue-700/60 backdrop-blur-md";
      border = "border-blue-700";
      txt = "text-blue-100";
      shadow = "shadow-blue-900/10";
      break;
    case "yellow":
      bg =
        "bg-gradient-to-t from-yellow-700/80 to-yellow-600/70 backdrop-blur-md";
      border = "border-yellow-600";
      txt = "text-yellow-50";
      shadow = "shadow-yellow-800/10";
      break;
    case "red":
      bg = "bg-gradient-to-t from-red-900/80 to-red-700/60 backdrop-blur-md";
      border = "border-red-900";
      txt = "text-red-100";
      shadow = "shadow-red-800/10";
      break;
    default:
      bg = "bg-slate-800/80";
      border = "border-slate-700";
      txt = "text-slate-100";
      shadow = "shadow-slate-800/10";
  }
  return (
    <div
      className={`
        rounded-2xl border-2 px-8 py-7 flex flex-col justify-between min-w-[210px] max-w-[250px]
        ${bg} ${border} ${txt} ${shadow}
        shadow-lg cursor-pointer
        hover:scale-105 hover:shadow-2xl transition-all duration-200
        glassmorph-card
      `}
      style={{
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      <div className="font-semibold mb-2 text-base">{title}</div>
      <div className="text-4xl font-extrabold tracking-wider">{value}</div>
    </div>
  );
}

function PanelBox({ title, children, customClass }) {
  return (
    <section
      className={`
        rounded-2xl p-7 flex flex-col border border-green-900/60 shadow-md flex-1
        bg-green-900/80 glassmorph-card
        ${customClass ? customClass : ""}
      `}
      style={{
        backdropFilter: "blur(17px)",
        WebkitBackdropFilter: "blur(17px)",
      }}
    >
      <h2 className="font-bold text-green-200 mb-4 text-xl flex items-center gap-2">
        {title}
      </h2>
      <div>{children}</div>
    </section>
  );
}

function FormInput({ label, type = "text", value, placeholder, onChange }) {
  return (
    <div>
      <label className="text-xs text-green-200 mb-1 block">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        className="w-full rounded-lg border border-green-700/60 bg-green-950/50 px-3 py-2 text-green-50"
      />
    </div>
  );
}

function DataTable({ data }) {
  if (!data || !data.length)
    return <div className="text-center text-green-100">Tidak ada data.</div>;
  const columns = Object.keys(data[0] || {});
  return (
    <div className="overflow-auto max-h-[320px]">
      <table className="w-full text-base">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                className="text-left text-green-300 font-semibold pr-4"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.slice(0, 10).map((row, idx) => (
            <tr key={idx} className="text-green-100 font-medium">
              {columns.map((col) => (
                <td key={col} className="pr-4">
                  {row[col]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DynamicForm({ module }) {
  const fields = module.fields || [];
  const initial = {};
  fields.forEach((f) => {
    const key = f.field_name || f.name || f.id || f.key || "field";
    initial[key] = "";
  });

  const [values, setValues] = useState(initial);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const init = {};
    fields.forEach((f) => {
      const key = f.field_name || f.name || f.id || f.key || "field";
      init[key] = "";
    });
    setValues(init);
    setSaved(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [module?.id]);

  const handleChange = (k, v) => setValues((s) => ({ ...s, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const existing = JSON.parse(
        localStorage.getItem("ketersediaan_demo_submissions") || "[]",
      );
      existing.push({
        module: module.name || module.nama_modul || module.id,
        created: Date.now(),
        values,
      });
      localStorage.setItem(
        "ketersediaan_demo_submissions",
        JSON.stringify(existing),
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  if (!fields || !fields.length)
    return (
      <div className="text-sm text-green-100">
        Tidak ada field untuk modul ini.
      </div>
    );

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {fields.map((f, idx) => {
          const key = f.field_name || f.name || f.id || f.key || `field_${idx}`;
          const label = f.label || f.title || key;
          const type = (f.type || "string").toLowerCase();

          if (type.includes("text") || type.includes("memo")) {
            return (
              <div key={key}>
                <label className="text-xs text-green-200 mb-1 block">
                  {label}
                </label>
                <textarea
                  className="w-full p-2 rounded bg-green-900/40"
                  value={values[key] || ""}
                  onChange={(e) => handleChange(key, e.target.value)}
                />
              </div>
            );
          }

          const inputType = type.includes("date")
            ? "date"
            : type.includes("int") || type.includes("num")
              ? "number"
              : "text";

          return (
            <div key={key}>
              <label className="text-xs text-green-200 mb-1 block">
                {label}
              </label>
              <input
                className="w-full p-2 rounded bg-green-900/40"
                value={values[key] || ""}
                onChange={(e) => handleChange(key, e.target.value)}
                type={inputType}
              />
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-2 mt-2">
        <button
          className="px-3 py-2 bg-yellow-400 text-slate-900 rounded font-semibold"
          type="submit"
        >
          Simpan (Demo)
        </button>
        {saved && <span className="text-green-300 text-sm">Tersimpan</span>}
      </div>
    </form>
  );
}

function NotificationBell() {
  return (
    <span
      className="w-10 h-10 bg-gradient-to-br from-yellow-300 to-yellow-200 rounded-full flex items-center justify-center text-yellow-900 text-2xl shadow-md ring-2 ring-yellow-100 animate-spin-slow"
      title="Notifikasi"
    >
      🔔
    </span>
  );
}

function ProfileAvatar({ userName = "User" }) {
  return (
    <span className="flex w-10 h-10 rounded-full bg-green-700 border-2 border-green-400 items-center justify-center text-white text-lg font-bold shadow-xl hover:ring-2 hover:ring-green-500 transition">
      {String(userName)
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)}
    </span>
  );
}

/* ==== Animasi CSS ==== */
const style = document.createElement("style");
style.textContent = `
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(30px);}
  to { opacity: 1; transform: translateY(0);}
}
.animate-fade-in-up {
  animation: fade-in-up 0.3s cubic-bezier(0.4,0,0.2,1) both;
}
@keyframes spin-slow {
  0% {transform: rotate(0);}
  100% {transform: rotate(360deg);}
}
.animate-spin-slow {
  animation: spin-slow 2.8s linear infinite;
}
.glassmorph-card {
  background-clip: padding-box;
  box-shadow:
    0 4px 32px 0 rgba(16,185,129,0.12),
    0 1.5px 9px 0 rgba(0,0,0,0.16);
}
`;
if (
  typeof document !== "undefined" &&
  !document.getElementById("sigap-anim-ket")
) {
  style.id = "sigap-anim-ket";
  document.head.appendChild(style);
}
