import React from "react";

export default function RoleSwitch({ roles, currentRole, onSwitch }) {
  return (
    <div className="flex gap-2 items-center">
      <span className="text-xs text-muted">Role:</span>
      <select
        className="rounded border px-2 py-1 text-sm"
        value={currentRole}
        onChange={(e) => onSwitch(e.target.value)}
        aria-label="Role Switch"
      >
        {roles.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>
    </div>
  );
}
