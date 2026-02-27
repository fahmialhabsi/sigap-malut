import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import PermissionForm from "./PermissionForm";

export default function PermissionEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initial, setInitial] = useState(null);

  useEffect(() => {
    axios
      .get(`/api/rbac/permissions/${id}`)
      .then((r) => setInitial(r.data.data))
      .catch(() => {});
  }, [id]);

  if (!initial) return <div className="p-4">Loading...</div>;
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-3">Edit Permission</h2>
      <PermissionForm
        initial={initial}
        onSaved={() => navigate("/rbac/permissions")}
      />
    </div>
  );
}
