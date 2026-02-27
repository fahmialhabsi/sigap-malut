import React from "react";
import { useNavigate } from "react-router-dom";
import PermissionForm from "./PermissionForm";

export default function PermissionCreate() {
  const navigate = useNavigate();
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-3">Create Permission</h2>
      <PermissionForm onSaved={() => navigate("/rbac/permissions")} />
    </div>
  );
}
