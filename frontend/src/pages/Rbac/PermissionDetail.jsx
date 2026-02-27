import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

export default function PermissionDetail() {
  const { id } = useParams();
  const [perm, setPerm] = useState(null);
  useEffect(() => {
    axios
      .get(`/api/rbac/permissions/${id}`)
      .then((r) => setPerm(r.data.data))
      .catch(() => {});
  }, [id]);
  if (!perm) return <div className="p-4">Loading...</div>;
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Permission: {perm.key}</h2>
      <p className="mt-2">{perm.description}</p>
      <div className="mt-4">
        <Link to="/rbac/permissions" className="text-blue-600">
          Back
        </Link>
      </div>
    </div>
  );
}
