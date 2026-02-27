import React, { useEffect, useState } from "react";
import axios from "axios";

export default function PermissionsList() {
  const [perms, setPerms] = useState([]);
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");

  async function load() {
    const res = await axios.get("/api/rbac/permissions", {
      params: { page, limit: 25, q },
    });
    setPerms(res.data.data);
    setMeta(res.data.meta || {});
  }

  useEffect(() => {
    load();
  }, [page, q]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Permissions</h2>
      <div className="mb-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search"
          className="border p-2"
        />
      </div>
      <table className="w-full table-auto border">
        <thead>
          <tr>
            <th className="border p-2">Key</th>
            <th className="border p-2">Description</th>
          </tr>
        </thead>
        <tbody>
          {perms.map((p) => (
            <tr key={p.id}>
              <td className="border p-2">{p.key}</td>
              <td className="border p-2">{p.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3">
        <button onClick={() => setPage(Math.max(1, page - 1))} className="mr-2">
          Prev
        </button>
        <span>
          Page {meta.page || 1} / {meta.pages || 1}
        </span>
        <button onClick={() => setPage((meta.page || 1) + 1)} className="ml-2">
          Next
        </button>
      </div>
    </div>
  );
}
