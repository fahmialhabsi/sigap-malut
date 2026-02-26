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

export default function DashboardDistribusiSuperModern() {
  // State
  const sidebarOpen = window.innerWidth > 768;
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [modules, setModules] = useState([]);
  const [menuAktif, setMenuAktif] = useState("");
  const [user, setUser] = useState(null);
  const [tableRows, setTableRows] = useState([]);
  const [kpi, setKpi] = useState([]); // PATCH: Digunakan!
  const [chart, setChart] = useState({ labels: [], datasets: [] }); // PATCH: Digunakan!
  const [notifikasi, setNotifikasi] = useState([]); // PATCH: Digunakan!
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  // Ambil info user & role dari backend
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        setUser(data.data);
        setAuthChecked(true);
        const roleName = data.data ? roleIdToName[data.data.role_id] : null;
        if (
          !data.data ||
          !(
            roleName === "kepala_bidang_distribusi" ||
            roleName === "super_admin" ||
            data.data.unit_kerja === "Bidang Distribusi"
          )
        ) {
          window.location.href = "/landing";
        }
      })
      .catch(() => {
        setAuthChecked(true);
        window.location.href = "/landing";
      });
  }, []);

  // Ambil modul sidebar bidang distribusi
  useEffect(() => {
    if (!authChecked) return;
    fetch("/api/modules")
      .then((res) => res.json())
      .then((data) => {
        const distribusi = data.data?.filter(
          (row) => row.bidang === "Bidang Distribusi" && row.is_active,
        );
        setModules(distribusi || []);
        if (distribusi?.length) setMenuAktif(distribusi[0].nama_modul);
      });
  }, [authChecked]);

  // Ambil data utama sesuai modul aktif
  useEffect(() => {
    if (!menuAktif) return;
    const active = modules.find((m) => m.nama_modul === menuAktif);
    if (!active) return;

    // Fetch tableRows
    fetch(`/api/tables/${active.tabel_name}`)
      .then((res) => res.json())
      .then((data) => setTableRows(data.data || []))
      .finally(() => setLoading(false));

    // Fetch KPI
    fetch(`/api/tables/${active.tabel_name}`)
      .then((res) => res.json())
      .then((data) =>
        setKpi([
          {
            title: "Total Data",
            value: data.count || (data.data ? data.data.length : 0),
            color: "blue",
          },
        ]),
      );

    // Fetch Chart
    fetch(`/api/tables/${active.tabel_name}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.data || !Array.isArray(data.data)) return;
        const perBulan = {};
        data.data.forEach((row) => {
          const bln = row.bulan || "Jan";
          perBulan[bln] = (perBulan[bln] || 0) + (row.jumlah || 1);
        });
        setChart({
          labels: Object.keys(perBulan),
          datasets: [
            {
              label: "Trend",
              data: Object.values(perBulan),
              borderColor: "#38bdf8",
              backgroundColor: "#38bdf844",
              tension: 0.4,
              fill: true,
              pointBackgroundColor: "#60a5fa",
              pointRadius: 5,
            },
          ],
        });
      });

    // Notifikasi
    fetch("/api/notification")
      .then((res) => res.json())
      .then((data) => setNotifikasi(data || []));
  }, [menuAktif, modules]);

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
      x: { grid: { color: "#33415566" }, ticks: { color: "#f1f5f9" } },
      y: { grid: { color: "#33415544" }, ticks: { color: "#f1f5f9" } },
    },
  };

  return (
    <div className="fixed inset-0 flex font-inter bg-gradient-to-br from-blue-900 via-blue-800 to-slate-800 text-slate-100 select-none">
      <aside
        className={`h-full bg-blue-950/95 z-30 flex flex-col items-center 
        transition-all duration-300 ${sidebarOpen ? "w-[275px] min-w-[275px]" : "w-[60px] min-w-[60px]"}
        border-r border-blue-900/60 shadow-xl`}
      >
        <div className="flex items-center justify-center w-full py-8">
          <img
            src="/Logo.png"
            alt="logo"
            className={`object-contain ${sidebarOpen ? "w-24 h-24" : "w-10 h-10"}`}
          />
        </div>
        <nav className="w-full flex flex-col gap-4 flex-1 justify-center px-3">
          {modules.map((modul) => (
            <SidebarItem
              key={modul.modul_id}
              label={modul.nama_modul}
              active={menuAktif === modul.nama_modul}
              sidebarOpen={sidebarOpen}
              onClick={() => setMenuAktif(modul.nama_modul)}
            />
          ))}
        </nav>
        <div className="py-6 w-full text-xs text-blue-100/70 text-center tracking-wide">
          {sidebarOpen ? "SIGAP Malut" : "SIGAP"}
        </div>
      </aside>
      <div className="flex-1 min-w-0 min-h-0 h-full flex flex-col bg-blue-950/80 backdrop-blur">
        <header className="flex-none w-full h-[75px] bg-blue-900/80 flex items-center px-12 shadow-sm z-10 sticky top-0">
          <div className="text-2xl text-white font-bold tracking-wide flex-1">
            SIGAP <span className="font-light">·</span> Bidang Distribusi
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
                sidebarOpen={true}
                userName={user?.nama_lengkap || "User"}
              />
            </button>
            {avatarOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-slate-900/95 rounded-xl shadow-lg border border-blue-950 p-3 flex flex-col text-sm animate-fade-in-up">
                <div className="font-bold mb-2">
                  {user?.nama_lengkap || "Pengguna"}
                </div>
                <div className="mb-2 text-blue-200 text-xs">
                  {user?.unit_kerja || ""}
                </div>
                <button className="py-1 w-full rounded text-left hover:bg-blue-800/60 px-2">
                  Profil Saya
                </button>
                <button className="py-1 w-full rounded text-left hover:bg-blue-800/60 px-2">
                  Pengaturan
                </button>
                <button className="py-1 w-full rounded text-left hover:bg-blue-800/60 px-2 text-red-400">
                  Keluar
                </button>
              </div>
            )}
          </div>
        </header>
        <main
          className={`flex-1 min-h-0 min-w-0 flex flex-col gap-9 py-8 overflow-auto bg-transparent`}
        >
          {/* Loading Spinner */}
          {loading && (
            <div className="w-full text-center py-6">
              <span className="text-blue-200 font-bold text-lg">
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
              <DataTable data={tableRows} />
            </PanelBox>
            <PanelBox title="Grafik Tren Distribusi">
              <div className="h-56 flex items-center justify-center">
                <Line data={chart} options={chartOptions} />
              </div>
            </PanelBox>
          </div>
          <div className="w-full max-w-7xl mx-auto px-2">
            <PanelBox
              title="Notifikasi Kritis"
              customClass="!bg-gradient-to-r !from-blue-900/95 !to-slate-900/80"
            >
              <ul className="space-y-2 text-sm">
                {(Array.isArray(notifikasi) && notifikasi.length
                  ? notifikasi
                  : []
                ).map((n, idx) => (
                  <li
                    key={idx}
                    className={`flex items-center gap-2 text-yellow-300`}
                  >
                    <span className="text-lg">{n.icon ?? "⚠️"}</span>
                    {n.message || n.text || ""}
                  </li>
                ))}
              </ul>
            </PanelBox>
          </div>
        </main>

        <footer className="flex-none h-10 flex items-center text-xs justify-between px-10 w-full bg-gradient-to-r from-blue-900 to-blue-800/70 text-blue-100/80">
          <span>SIGAP Malut</span>
          <span>SIGAP Malut v1 | Bidang Distribusi</span>
        </footer>
      </div>
    </div>
  );
}

function SidebarItem({ label, active, sidebarOpen, badge, onClick }) {
  return (
    <div className="relative w-full flex items-center group transition">
      {active && (
        <div className="absolute left-2 h-[52px] w-2 bg-gradient-to-b from-yellow-400 to-yellow-200 rounded-r-lg scale-105 shadow-lg transition"></div>
      )}
      <button
        className={`
          h-[52px] w-full pl-10 pr-5 text-lg flex items-center rounded-2xl font-semibold
          ${active ? "bg-blue-800/90 text-yellow-300" : "bg-blue-700/85 text-blue-100 hover:bg-blue-800/85"}
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
          <span className="ml-2 w-6 h-6 text-[13px] bg-red-500 text-white rounded-full flex items-center justify-center border-2 border-blue-900 animate-pulse">
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
        rounded-2xl p-7 flex flex-col border border-blue-900/60 shadow-md flex-1
        bg-blue-900/80 glassmorph-card
        ${customClass ? customClass : ""}
      `}
      style={{
        backdropFilter: "blur(17px)",
        WebkitBackdropFilter: "blur(17px)",
      }}
    >
      <h2 className="font-bold text-blue-200 mb-4 text-xl flex items-center gap-2">
        {title}
      </h2>
      <div>{children}</div>
    </section>
  );
}

function DataTable({ data }) {
  if (!data || !data.length)
    return <div className="text-center text-blue-100">Tidak ada data.</div>;
  const columns = Object.keys(data[0]);
  return (
    <div className="overflow-auto max-h-[320px]">
      <table className="w-full text-base">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                className="text-left text-blue-300 font-semibold pr-4"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.slice(0, 10).map((row, idx) => (
            <tr key={idx} className="text-blue-100 font-medium">
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
    <span className="flex w-10 h-10 rounded-full bg-blue-700 border-2 border-blue-400 items-center justify-center text-white text-lg font-bold shadow-xl hover:ring-2 hover:ring-blue-500 transition">
      {userName
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
    0 4px 32px 0 rgba(30,64,175,0.14),
    0 1.5px 9px 0 rgba(0,0,0,0.16);
}
`;
if (typeof document !== "undefined" && !document.getElementById("sigap-anim")) {
  style.id = "sigap-anim";
  document.head.appendChild(style);
}
