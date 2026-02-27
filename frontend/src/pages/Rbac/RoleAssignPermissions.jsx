import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function RoleAssignPermissions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [allPerms, setAllPerms] = useState([]);
  const [assigned, setAssigned] = useState(new Set());

  useEffect(() => {
    axios
      .get("/api/rbac/permissions", { params: { page: 1, limit: 1000 } })
      .then((r) => setAllPerms(r.data.data))
      .catch(() => {});
    axios
      .get(`/api/rbac/roles/${id}`)
      .then((r) => {
        const perms = r.data.data.permissions || [];
        setAssigned(new Set(perms.map((p) => p.id)));
      })
      .catch(() => {});
  }, [id]);

  function toggle(pid) {
    const s = new Set(assigned);
    if (s.has(pid)) s.delete(pid);
    else s.add(pid);
    setAssigned(s);
  }

  async function save() {
    const permissionIds = Array.from(assigned);
    await axios.post(`/api/rbac/roles/${id}/permissions`, { permissionIds });
    navigate(`/rbac/roles/${id}`);
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-3">Manage Permissions for Role</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {allPerms.map((p) => (
          <label key={p.id} className="border p-2 flex items-center">
            <input
              type="checkbox"
              checked={assigned.has(p.id)}
              onChange={() => toggle(p.id)}
              className="mr-2"
            />
            <div>
              <div className="font-medium">{p.key}</div>
              <div className="text-sm text-muted">{p.description}</div>
            </div>
          </label>
        ))}
      </div>
      <div className="mt-3">
        <button onClick={save} className="bg-blue-600 text-white px-3 py-1">
          Save
        </button>
      </div>
    </div>
  );
}
