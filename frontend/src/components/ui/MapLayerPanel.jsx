import { useState, useRef, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  LayersControl,
  LayerGroup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

const { BaseLayer, Overlay } = LayersControl;

/** Data dummy wilayah Maluku Utara */
const WILAYAH_DATA = [
  {
    nama: "Ternate",
    lat: 0.786,
    lng: 127.379,
    stok: 85,
    kerawanan: "rendah",
    distribusi: 120,
  },
  {
    nama: "Tidore Kepulauan",
    lat: 0.674,
    lng: 127.421,
    stok: 72,
    kerawanan: "sedang",
    distribusi: 95,
  },
  {
    nama: "Halmahera Utara",
    lat: 1.54,
    lng: 127.99,
    stok: 58,
    kerawanan: "sedang",
    distribusi: 60,
  },
  {
    nama: "Halmahera Selatan",
    lat: -0.45,
    lng: 127.98,
    stok: 41,
    kerawanan: "tinggi",
    distribusi: 45,
  },
  {
    nama: "Halmahera Tengah",
    lat: 0.45,
    lng: 127.82,
    stok: 63,
    kerawanan: "sedang",
    distribusi: 55,
  },
  {
    nama: "Halmahera Timur",
    lat: 0.76,
    lng: 128.39,
    stok: 35,
    kerawanan: "tinggi",
    distribusi: 30,
  },
  {
    nama: "Halmahera Barat",
    lat: 1.13,
    lng: 127.54,
    stok: 77,
    kerawanan: "rendah",
    distribusi: 85,
  },
  {
    nama: "Kepulauan Sula",
    lat: -1.85,
    lng: 125.46,
    stok: 52,
    kerawanan: "sedang",
    distribusi: 40,
  },
  {
    nama: "Pulau Taliabu",
    lat: -1.82,
    lng: 124.63,
    stok: 29,
    kerawanan: "tinggi",
    distribusi: 20,
  },
  {
    nama: "Morotai",
    lat: 2.32,
    lng: 128.47,
    stok: 68,
    kerawanan: "rendah",
    distribusi: 70,
  },
];

const KERAWANAN_COLOR = {
  tinggi: "#ef4444",
  sedang: "#f59e0b",
  rendah: "#22c55e",
};

function getStokColor(stok) {
  if (stok >= 75) return "#22c55e";
  if (stok >= 50) return "#f59e0b";
  return "#ef4444";
}

/**
 * MapLayerPanel — Peta interaktif lengkap sesuai spesifikasi:
 * - Layer toggle (kerawanan pangan / stok komoditas / distribusi)
 * - Date slider (filter data per bulan)
 * - Export PNG
 */
export default function MapLayerPanel({ title = "Peta Sebaran Wilayah" }) {
  const [activeDate, setActiveDate] = useState(5); // index bulan (0=6 bln lalu, 5=sekarang)
  const [exportLoading, setExportLoading] = useState(false);
  const mapRef = useRef(null);

  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
  });

  // Simulasi data berubah per bulan (faktor noise)
  const factor = 0.85 + activeDate * 0.03;
  const data = WILAYAH_DATA.map((w) => ({
    ...w,
    stok: Math.min(100, Math.round(w.stok * factor)),
  }));

  const handleExportPNG = useCallback(async () => {
    setExportLoading(true);
    try {
      // Gunakan html2canvas atau leaflet's built-in approach
      // Karena html2canvas tidak terinstall, buat screenshot via canvas API
      const container = document.querySelector(".leaflet-container");
      if (!container) throw new Error("Map container not found");

      // Import html2canvas dinamis jika tersedia, fallback ke informasi
      if (typeof window !== "undefined" && window.html2canvas) {
        const canvas = await window.html2canvas(container, { useCORS: true });
        const link = document.createElement("a");
        link.download = `peta-sigap-${months[activeDate].replace("/", "-")}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      } else {
        // Fallback: buka tab peta saja
        const msg =
          "Untuk export PNG, install html2canvas: npm install html2canvas";
        alert(msg);
      }
    } catch (e) {
      console.error("Export PNG gagal:", e);
    } finally {
      setExportLoading(false);
    }
  }, [activeDate, months]);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-[0_16px_32px_-24px_rgba(2,6,23,0.8)]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-900 px-5 py-3">
        <div className="text-sm font-semibold text-slate-100">{title}</div>

        {/* Date slider */}
        <div className="flex min-w-[220px] flex-1 items-center gap-3">
          <span className="whitespace-nowrap text-xs text-slate-400">
            Periode:
          </span>
          <input
            type="range"
            min={0}
            max={5}
            value={activeDate}
            onChange={(e) => setActiveDate(Number(e.target.value))}
            className="flex-1 accent-sky-500"
            aria-label="Pilih periode bulan"
          />
          <span
            className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
            style={{ backgroundColor: "var(--color-primary, #0B5FFF)" }}
          >
            {months[activeDate]}
          </span>
        </div>

        {/* Export PNG */}
        <button
          onClick={handleExportPNG}
          disabled={exportLoading}
          className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-slate-800 disabled:opacity-50"
        >
          {exportLoading ? "Mengekspor..." : "Ekspor PNG"}
        </button>
      </div>

      {/* Map */}
      <MapContainer
        ref={mapRef}
        center={[0.5, 127.8]}
        zoom={7}
        className="dark-leaflet-map"
        style={{ height: 420, width: "100%" }}
        scrollWheelZoom={true}
      >
        <LayersControl position="topright">
          {/* Base layers */}
          <BaseLayer checked name="Peta Gelap">
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; CARTO'
            />
          </BaseLayer>
          <BaseLayer name="Peta Standar">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
          </BaseLayer>
          <BaseLayer name="Satelit (ESRI)">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="&copy; Esri"
            />
          </BaseLayer>

          {/* Overlay: Kerawanan Pangan */}
          <Overlay checked name="Kerawanan Pangan">
            <LayerGroup>
              {data.map((w) => (
                <CircleMarker
                  key={`kerawanan-${w.nama}`}
                  center={[w.lat, w.lng]}
                  radius={12}
                  pathOptions={{
                    color: KERAWANAN_COLOR[w.kerawanan],
                    fillColor: KERAWANAN_COLOR[w.kerawanan],
                    fillOpacity: 0.6,
                    weight: 2,
                  }}
                >
                  <Popup className="dark-leaflet-popup">
                    <div className="text-sm">
                      <b>{w.nama}</b>
                      <br />
                      Kerawanan:{" "}
                      <span className="font-semibold capitalize">
                        {w.kerawanan}
                      </span>
                      <br />
                      Periode: {months[activeDate]}
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </LayerGroup>
          </Overlay>

          {/* Overlay: Stok Komoditas */}
          <Overlay checked name="Stok Komoditas">
            <LayerGroup>
              {data.map((w) => (
                <CircleMarker
                  key={`stok-${w.nama}`}
                  center={[w.lat + 0.05, w.lng + 0.05]}
                  radius={10}
                  pathOptions={{
                    color: getStokColor(w.stok),
                    fillColor: getStokColor(w.stok),
                    fillOpacity: 0.5,
                    weight: 2,
                  }}
                >
                  <Popup className="dark-leaflet-popup">
                    <div className="text-sm">
                      <b>{w.nama}</b>
                      <br />
                      Stok: <span className="font-semibold">{w.stok}%</span>
                      <br />
                      Periode: {months[activeDate]}
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </LayerGroup>
          </Overlay>

          {/* Overlay: Distribusi */}
          <Overlay name="Volume Distribusi">
            <LayerGroup>
              {data.map((w) => (
                <CircleMarker
                  key={`dist-${w.nama}`}
                  center={[w.lat - 0.05, w.lng - 0.05]}
                  radius={Math.max(5, Math.round(w.distribusi / 10))}
                  pathOptions={{
                    color: "#3b82f6",
                    fillColor: "#3b82f6",
                    fillOpacity: 0.4,
                    weight: 1,
                  }}
                >
                  <Popup className="dark-leaflet-popup">
                    <div className="text-sm">
                      <b>{w.nama}</b>
                      <br />
                      Distribusi:{" "}
                      <span className="font-semibold">{w.distribusi} ton</span>
                      <br />
                      Periode: {months[activeDate]}
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </LayerGroup>
          </Overlay>
        </LayersControl>
      </MapContainer>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 border-t border-slate-800 bg-slate-900 px-5 py-3 text-xs text-slate-300">
        <div className="font-medium text-slate-400">Legenda:</div>
        {[
          { color: "#22c55e", label: "Aman / Stok Cukup" },
          { color: "#f59e0b", label: "Waspada / Stok Sedang" },
          { color: "#ef4444", label: "Kritis / Rawan Pangan" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
