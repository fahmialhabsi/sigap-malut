import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function Dashboard() {
  const [kpis, setKpis] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const r = await api.get("/kpi");
        if (mounted) setKpis(r.data);
      } catch (e) {
        setKpis([]);
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-3 gap-4">
        {kpis.length ? (
          kpis.map((k) => (
            <div key={k.name} className="p-3 border rounded">
              <div className="text-sm text-gray-500">{k.name}</div>
              <div className="text-2xl font-semibold">{k.value}</div>
              <div className="text-xs text-gray-400">Sumber: {k.source}</div>
            </div>
          ))
        ) : (
          <div>Tidak ada KPI</div>
        )}
      </div>
    </div>
  );
}
