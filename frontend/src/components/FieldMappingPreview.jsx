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
    return <div className="text-muted">Tidak ada field mapping ditemukan.</div>;

  return (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full border text-xs">
        <thead>
          <tr className="bg-gray-100">
            {Object.keys(fields[0]).map((k) => (
              <th key={k} className="border px-2 py-1">
                {k}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {fields.map((row, i) => (
            <tr key={i}>
              {Object.values(row).map((v, j) => (
                <td key={j} className="border px-2 py-1">
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
