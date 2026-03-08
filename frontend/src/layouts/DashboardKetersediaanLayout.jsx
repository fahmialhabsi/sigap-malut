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
import useAuthStore from "../stores/authStore";
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
  const storeUser = useAuthStore((state) => state.user);
  const storeRole = normalizeRoleName(storeUser);

  // Optional: extra guard (so layout still works even if someone lands directly)
  useEffect(() => {
    if (!storeUser) return;
    const allowed =
      storeRole === "kepala_bidang_ketersediaan" ||
      storeRole === "super_admin" ||
      storeRole === "kepala_dinas" ||
      storeRole === "gubernur";
    if (!allowed) window.location.href = "/";
  }, [storeUser, storeRole]);

  const sidebarOpen = window.innerWidth > 768;
  const [modules, setModules] = useState(fallbackModules || []);
  const [menuAktif, setMenuAktif] = useState("");
  const [chart, setChart] = useState({ labels: [], datasets: [] });
  const [notifikasi, setNotifikasi] = useState([]);
  const [loading, setLoading] = useState(false);
  const [kpi, setKpi] = useState([]);
  const [tableRows, setTableRows] = useState([]);
  const lastModulesFetch = useRef(0);

  useEffect(() => {
    const now = Date.now();
    if (now - lastModulesFetch.current < 5000) return;
    lastModulesFetch.current = now;

    api.get("/modules/ketersediaan").then((res) => {
      const data = res.data;
      setModules(data);
      setMenuAktif(data[0]?.nama_modul || "");
    });
  }, []);

  useEffect(() => {
    if (!menuAktif) return;
    const activeModule = modules.find((mod) => mod.nama_modul === menuAktif);
    if (!activeModule) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/data/${activeModule.id}`);
        setTableRows(res.data.rows);
        setKpi([
          {
            title: "Total Data",
            value: res.data.rows.length,
            color: "blue",
          },
        ]);
        setChart({
          labels: res.data.chart.labels,
          datasets: res.data.chart.datasets,
        });
        setNotifikasi(res.data.notifications);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [menuAktif, modules]);

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: "#33415566" }, ticks: { color: "#f1f5f9" } },
      y: { grid: { color: "#33415544" }, ticks: { color: "#f1f5f9" } },
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
            className={`object-contain ${
              sidebarOpen ? "w-24 h-24" : "w-10 h-10"
            }`}
          />
        </div>
        <nav className="w-full flex flex-col gap-4 flex-1 justify-center px-3">
          {modules.map((modul) => (
            <SidebarItem
              key={modul.id}
              label={modul.nama_modul}
              active={menuAktif === modul.nama_modul}
              sidebarOpen={sidebarOpen}
              onClick={() => setMenuAktif(modul.nama_modul)}
            />
          ))}
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
              <DataTable data={tableRows} />
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
                {notifikasi.map((notif, idx) => (
                  <li key={idx} className="text-yellow-300">
                    {notif.message}
                  </li>
                ))}
              </ul>
            </PanelBox>
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarItem({ label, active, sidebarOpen, onClick }) {
  return (
    <div className="relative w-full flex items-center group transition">
      {active && (
        <div className="absolute left-2 h-[52px] w-2 bg-gradient-to-b from-yellow-400 to-yellow-200 rounded-r-lg scale-105 shadow-lg transition"></div>
      )}
      <button
        className={`
          h-[52px] w-full pl-10 pr-5 text-lg flex items-center rounded-2xl font-semibold
          ${
            active
              ? "bg-green-800/90 text-yellow-300"
              : "bg-green-700/85 text-green-100 hover:bg-green-800/85"
          }
          shadow group-hover:scale-105
          transition-all
          relative
        `}
        onClick={onClick}
      >
        <span className="flex-1 text-left">
          {sidebarOpen ? label : label[0]}
        </span>
      </button>
    </div>
  );
}

function PanelBox({ title, children }) {
  return (
    <section
      className="rounded-2xl p-7 flex flex-col border border-green-900/60 shadow-md flex-1 bg-green-900/80 glassmorph-card"
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
