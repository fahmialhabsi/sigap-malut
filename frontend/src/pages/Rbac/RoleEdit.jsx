import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import RoleForm from "./RoleForm";

export default function RoleEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initial, setInitial] = useState(null);

  useEffect(() => {
    axios
      .get(`/api/rbac/roles/${id}`)
      .then((r) => setInitial(r.data.data.role))
      .catch(() => {});
  }, [id]);

  if (!initial) return <div className="p-4">Loading...</div>;
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-3">Edit Role</h2>
      <RoleForm initial={initial} onSaved={() => navigate("/rbac/roles")} />
      <div className="mt-4">
        <Link to={`/rbac/roles/${id}/assign`} className="text-blue-600">
          Manage Permissions
        </Link>
      </div>
    </div>
  );
}
