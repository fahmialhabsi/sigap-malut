import BaseTable from "../../components/base/BaseTable";

const kpiData = [
  {
    id: 1,
    indikator: "Kepatuhan Laporan Harian",
    nilai: 100,
    target: 100,
    status: "Tercapai",
  },
  {
    id: 2,
    indikator: "Bypass Terdeteksi",
    nilai: 0,
    target: 0,
    status: "Aman",
  },
  {
    id: 3,
    indikator: "Validasi Data",
    nilai: 99,
    target: 100,
    status: "Valid",
  },
  // ...tambahkan 47 indikator lain sesuai kebutuhan
];

export default function SA01ListPage() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Monitoring 50 Indikator</h2>
      <table className="min-w-full border rounded-xl overflow-hidden">
        <thead className="bg-slate-100">
          <tr>
            <th className="px-4 py-2 text-left">Indikator</th>
            <th className="px-4 py-2 text-left">Nilai</th>
            <th className="px-4 py-2 text-left">Target</th>
            <th className="px-4 py-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {kpiData.map((row) => (
            <tr key={row.id} className="border-b">
              <td className="px-4 py-2">{row.indikator}</td>
              <td className="px-4 py-2">{row.nilai}%</td>
              <td className="px-4 py-2">{row.target}%</td>
              <td className="px-4 py-2">{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
