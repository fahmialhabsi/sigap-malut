import React, { useEffect, useState } from "react";
import { fetchFieldMapping } from "../utils/fieldMapping";

export default function FieldMappingPreview({ modulId }) {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    fetchFieldMapping(modulId).then((data) => {
      setFields(data || []);
      setLoading(false);
    });
  }, [modulId]);

  if (loading) return <div>Memuat field mapping...</div>;
  if (!fields || fields.length === 0)
    return (
      <div className="text-muted dark:text-gray-300">
        Tidak ada field mapping ditemukan.
      </div>
    );

  return (
    <div className="overflow-x-auto my-4">
      <div className="max-h-64 overflow-auto rounded-md border bg-white dark:bg-gray-800">
        <table className="min-w-full border text-xs table-auto">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-900">
              {Object.keys(fields[0]).map((k) => (
                <th
                  key={k}
                  className="sticky top-0 z-10 border px-2 py-1 text-left text-gray-600 dark:text-gray-200 font-medium text-[11px] bg-gray-100 dark:bg-gray-900"
                >
                  {k}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fields.map((row, i) => (
              <tr
                key={i}
                className="even:bg-white odd:bg-gray-50 dark:even:bg-gray-900 dark:odd:bg-gray-800"
              >
                {Object.values(row).map((v, j) => (
                  <td
                    key={j}
                    className="border px-2 py-1 text-gray-700 dark:text-gray-200 align-top text-[12px]"
                  >
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
