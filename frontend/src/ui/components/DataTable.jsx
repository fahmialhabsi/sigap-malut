import React from "react";

export default function DataTable({ columns, data, onRowAction }) {
  return (
    <div className="bg-card rounded-md shadow-md p-4 flex flex-col gap-3 border border-surface-border">
      <div className="font-semibold text-primary mb-2">Data Table</div>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted">
            {columns.map((col) => (
              <th key={col.key} className="px-2 py-1 text-left">
                {col.label}
              </th>
            ))}
            <th className="px-2 py-1 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map((row, idx) => (
              <tr key={row.id || idx} className="border-b border-muted">
                {columns.map((col) => (
                  <td key={col.key} className="px-2 py-1">
                    {row[col.key]}
                  </td>
                ))}
                <td className="px-2 py-1">
                  <button
                    className="px-2 py-1 rounded bg-accent text-white text-xs font-semibold"
                    onClick={() => onRowAction && onRowAction(row)}
                    aria-label="Row Action"
                  >
                    Action
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length + 1}
                className="text-center text-muted py-2"
              >
                No data
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
