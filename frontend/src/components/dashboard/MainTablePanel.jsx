import React from "react";

export default function MainTablePanel({ data }) {
  return (
    <div className="bg-white rounded-xl border-2 border-green-600 w-[550px] h-[170px] p-4 flex flex-col justify-between">
      <span className="text-green-600 font-bold text-base text-center mb-2">
        Tabel Surat/Disposisi
      </span>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-green-50 text-green-700">
              <th className="px-4 py-2 text-left">No</th>
              <th className="px-4 py-2 text-left">Jenis Surat</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((row, idx) => (
              <tr key={idx} className="border-b last:border-none">
                <td className="px-4 py-2">{idx + 1}</td>
                <td className="px-4 py-2">{row.jenis}</td>
                <td className="px-4 py-2">{row.status}</td>
                <td className="px-4 py-2">{row.tanggal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
