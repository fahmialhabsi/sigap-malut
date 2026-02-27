import React, { useState } from "react";
import axios from "axios";

export default function PermissionForm({ initial = {}, onSaved }) {
  const [key, setKey] = useState(initial.key || "");
  const [description, setDescription] = useState(initial.description || "");
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (initial.id) {
        await axios.put(`/api/rbac/permissions/${initial.id}`, {
          key,
          description,
        });
      } else {
        await axios.post("/api/rbac/permissions", { key, description });
      }
      onSaved && onSaved();
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="p-3 border">
      <div className="mb-2">
        <label className="block">Key</label>
        <input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          required
          className="border p-2 w-full"
        />
      </div>
      <div className="mb-2">
        <label className="block">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 w-full"
        />
      </div>
      <button disabled={saving} className="bg-blue-600 text-white px-3 py-1">
        Save
      </button>
    </form>
  );
}
