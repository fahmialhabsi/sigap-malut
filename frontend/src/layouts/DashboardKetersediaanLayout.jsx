import React, { useState, useEffect, useRef } from "react";
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import api from "../utils/api";
import { roleIdToName } from "../utils/roleMap";

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  Tooltip,
  Legend,
);

function normalizeRoleName(user) {
  return (
    (user?.roleName && String(user.roleName).toLowerCase()) ||
    user?.role ||
    roleIdToName?.[user?.role_id] ||
    roleIdToName?.[String(user?.role_id)] ||
    null
  );
}

export default function DashboardKetersediaanLayout({ fallbackModules = [] }) {
  // State
  const sidebarOpen = window.innerWidth > 768;
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
  const lastAuthFetch = useRef(0);
  const lastModulesFetch = useRef(0);

  // Ambil info user & role dari backend
  useEffect(() => {
    const now = Date.now();
    if (now - lastAuthFetch.current < 5000) return;
    lastAuthFetch.current = now;

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

  // Replace the existing "Ambil modul sidebar bidang ketersediaan" useEffect with this
  useEffect(() => {
    if (!authChecked) return;
    const now = Date.now();
    if (now - lastModulesFetch.current < 5000) return;
    lastModulesFetch.current = now;

    let mounted = true;
    api
      .get("/modules")
      .then((res) => {
        if (!mounted) return;

        console.log("DEBUG: /modules response:", res); // <-- full response

        // tolerant parsing for various response shapes
        const payload = res.data;
        const arr = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload?.result)
              ? payload.result
              : [];

        console.log("DEBUG: parsed modules array (arr):", arr);

        // do a tolerant bidang lookup (trim + ignore case)
        const ketersediaan = arr.filter((row) => {
          const bidang = String(
            row.bidang || row.bidang_name || row.bidangLabel || "",
          )
            .trim()
            .toLowerCase();
          return bidang === "bidang ketersediaan" || bidang === "ketersediaan";
        });

        console.log("DEBUG: filtered ketersediaan modules:", ketersediaan);

        if (ketersediaan && ketersediaan.length) {
          setModules(ketersediaan);
          setMenuAktif(
            (m) =>
              m ||
              ketersediaan[0].nama_modul ||
              ketersediaan[0].name ||
              ketersediaan[0].id,
          );
        } else if (arr && arr.length) {
          // fallback: use all modules if no bidang matches
          console.warn(
            "WARNING: no 'Bidang Ketersediaan' found — using all modules as fallback",
          );
          setModules(arr);
          setMenuAktif(
            (m) => m || arr[0].nama_modul || arr[0].name || arr[0].id,
          );
        } else if (fallbackModules && fallbackModules.length) {
          setModules(fallbackModules);
          setMenuAktif((m) => m || fallbackModules[0].name);
        } else {
          // still empty - show message in console
          console.warn(
            "No modules returned by API and no fallbackModules provided",
          );
          setModules([]);
        }
      })
      .catch((err) => {
        console.error("Fetch modules error:", err);
        if (mounted && fallbackModules && fallbackModules.length) {
          setModules(fallbackModules);
          setMenuAktif((m) => m || fallbackModules[0].name);
        }
      });

    return () => {
      mounted = false;
    };
  }, [authChecked]);

  // Data fetch for active module (table, chart, kpi, notifications)
  useEffect(() => {
    if (!menuAktif) return;
    const activeModule = modules.find(
      (mod) => mod.nama_modul === menuAktif || mod.name === menuAktif,
    );
    if (!activeModule) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/data/${activeModule.id}`);
        setTableRows(res.data.rows || []);
        setKpi([
          {
            title: "Total Data",
            value: (res.data.rows || []).length,
            color: "green",
          },
        ]);
        setChart({
          labels: res.data.chart?.labels || [],
          datasets: res.data.chart?.datasets || [],
        });
        setNotifikasi(res.data.notifications || []);
      } catch (err) {
        console.error("Fetch module data error:", err);
        setTableRows([]);
        setKpi([]);
        setChart({ labels: [], datasets: [] });
        setNotifikasi([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [menuAktif, modules]);

  // Dynamic form state when a fallback module is active
  const [dynamicFormModule, setDynamicFormModule] = useState(null);

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

  return (
    <div className="fixed inset-0 flex font-inter bg-gradient-to-br from-green-900 via-green-800 to-slate-800 text-slate-100 select-none">
      <aside
        className={`h-full bg-green-950/95 z-30 flex flex-col items-center 
        transition-all duration-300 ${
          sidebarOpen ? "w-[275px] min-w-[275px]" : "w-[60px] min-w-[60px]"
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
          {modules.map((modul) => {
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
                  setDynamicFormModule(null);
                  setMenuAktif(canonical);
                }}
              />
            );
          })}
        </nav>
        <div className="py-6 w-full text-xs text-green-100/70 text-center tracking-wide">
          {sidebarOpen ? "SIGAP Malut" : "SIGAP"}
        </div>
      </aside>

      <div className="flex-1 min-w-0 min-h-0 h-full flex flex-col bg-green-950/80 backdrop-blur">
        <header className="flex-none w-full h-[75px] bg-green-900/80 flex items-center px-12 shadow-sm z-10 sticky top-0">
          <div className="text-2xl text-white font-bold tracking-wide flex-1">
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
            {kpi.map((item, idx) => (
              <KpiCard
                key={idx}
                title={item.title}
                value={item.value}
                color={item.color}
              />
            ))}
          </div>

          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-9 px-2">
            <PanelBox title={`Tabel ${menuAktif}`}>
              {dynamicFormModule ? (
                <DynamicForm module={dynamicFormModule} />
              ) : (
                <DataTable data={tableRows} />
              )}
            </PanelBox>
            <PanelBox title="Grafik Tren Ketersediaan">
              <div className="h-56 flex items-center justify-center">
                <Line data={chart} options={chartOptions} />
              </div>
            </PanelBox>
          </div>

          <div className="w-full max-w-7xl mx-auto px-2">
            <PanelBox title="Notifikasi Kritis">
              <ul className="space-y-2 text-sm">
                {(Array.isArray(notifikasi) && notifikasi.length
                  ? notifikasi
                  : []
                ).map((n, idx) => (
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
