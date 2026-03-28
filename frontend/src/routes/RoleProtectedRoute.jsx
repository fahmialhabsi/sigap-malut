// RoleProtectedRoute.jsx
// Wrapper untuk proteksi akses per-role
import React from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../stores/authStore";
import { roleIdToName } from "../utils/roleMap";

export default function RoleProtectedRoute({ allowedRoles, children }) {
  const user = useAuthStore((state) => state.user);
  const roleName =
    (user?.roleName && String(user.roleName).toLowerCase()) ||
    user?.role ||
    roleIdToName?.[user?.role_id] ||
    roleIdToName?.[String(user?.role_id)] ||
    null;

  if (!user || !allowedRoles.includes(roleName)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
