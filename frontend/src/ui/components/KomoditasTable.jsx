import React from "react";

export default function KomoditasTable({ data, onAction }) {
  return (
    <div className="bg-card rounded-md shadow-md p-6 flex flex-col gap-6 border border-surface-border">
      <div className="font-semibold text-primary mb-4 text-lg">
        Top Komoditas
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted">
            <th className="px-4 py-3 text-left">Rank</th>
            <th className="px-4 py-3 text-left">Komoditas</th>
            <th className="px-4 py-3 text-left">Price Now</th>
            <th className="px-4 py-3 text-left">Price Prev</th>
            <th className="px-4 py-3 text-left">% Change</th>
            <th className="px-4 py-3 text-left">Contribution</th>
            <th className="px-4 py-3 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map((row, idx) => (
              <tr
                key={row.komoditas}
                className="border-b border-muted hover:bg-neutral-100 transition"
              >
                <td className="px-4 py-3 font-medium">{idx + 1}</td>
                <td className="px-4 py-3">{row.komoditas}</td>
                <td className="px-4 py-3">{row.priceNow}</td>
                <td className="px-4 py-3">{row.pricePrev}</td>
                <td className="px-4 py-3">{row.change}%</td>
                <td className="px-4 py-3">{row.contribution}</td>
                <td className="px-4 py-3">
                  <button
                    className="px-4 py-2 rounded bg-accent text-white text-xs font-semibold shadow-md"
                    onClick={() => onAction && onAction(row)}
                    aria-label="Propose Operation Market"
                  >
                    Propose
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="text-center text-muted py-4">
                No data
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
