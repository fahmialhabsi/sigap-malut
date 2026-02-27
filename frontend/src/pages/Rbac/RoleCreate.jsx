import React from "react";
import { useNavigate } from "react-router-dom";
import RoleForm from "./RoleForm";

export default function RoleCreate() {
  const navigate = useNavigate();
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-3">Create Role</h2>
      <RoleForm onSaved={() => navigate("/rbac/roles")} />
    </div>
  );
}
