import React from "react";

export default function DataTable({ columns, data }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border rounded-xl">
        <thead className="bg-gray-50 dark:bg-slate-800">
          <tr>
            {columns.map((col) => (
              <th
                key={col.accessor}
                className="p-2 text-left font-semibold text-xs text-muted dark:text-white"
              >
                {col.Header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="p-8 text-center text-muted dark:text-slate-300 bg-white dark:bg-slate-900"
              >
                Data kosong
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={idx}
                className="even:bg-gray-50 odd:bg-white dark:even:bg-slate-800 dark:odd:bg-slate-900"
              >
                {columns.map((col) => (
                  <td
                    key={col.accessor}
                    className="p-2 text-sm text-gray-900 dark:text-slate-100"
                  >
                    {row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
