import React, { useEffect, useState } from "react";
import axios from "axios";

export default function RolesList() {
  const [roles, setRoles] = useState([]);
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");

  async function load() {
    const res = await axios.get("/api/rbac/roles", {
      params: { page, limit: 25, q },
    });
    setRoles(res.data.data);
    setMeta(res.data.meta || {});
  }

  useEffect(() => {
    load();
  }, [page, q]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Roles</h2>
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
            <th className="border p-2">Name</th>
            <th className="border p-2">Description</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((r) => (
            <tr key={r.id}>
              <td className="border p-2">{r.name}</td>
              <td className="border p-2">{r.description}</td>
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
