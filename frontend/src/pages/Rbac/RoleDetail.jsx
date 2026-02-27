import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

export default function RoleDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  useEffect(() => {
    axios
      .get(`/api/rbac/roles/${id}`)
      .then((r) => setData(r.data.data))
      .catch(() => {});
  }, [id]);
  if (!data) return <div className="p-4">Loading...</div>;
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Role: {data.role.name}</h2>
      <p className="mt-2">{data.role.description}</p>
      <h3 className="mt-4">Permissions</h3>
      <ul>
        {data.permissions.map((p) => (
          <li key={p.id}>{p.key}</li>
        ))}
      </ul>
      <div className="mt-4">
        <Link to="/rbac/roles" className="text-blue-600 mr-4">
          Back
        </Link>
        <Link to={`/rbac/roles/${id}/assign`} className="text-blue-600">
          Manage Permissions
        </Link>
      </div>
    </div>
  );
}
