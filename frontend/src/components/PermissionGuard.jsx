import React, { useContext } from 'react';
import { AuthContext } from '../auth/AuthContext';

export default function PermissionGuard({ permission, children, fallback = null }) {
  const { user } = useContext(AuthContext);
  const perms = user && user.permissions ? user.permissions : [];
  if (perms.includes(permission)) return children;
  return fallback;
}
import React, { useContext } from "react";
import { AuthContext } from "../auth/AuthContext";

export default function PermissionGuard({ permission, children }) {
  const { user } = useContext(AuthContext);
  if (!user) return null;
  // permission is string like 'layanan:kgb:create'
  // app must supply user's permissions as array in user.permissions
  const perms = user.permissions || [];
  if (perms.includes("*") || perms.includes(permission)) return children;
  return null;
}
