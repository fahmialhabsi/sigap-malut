import React, { useState, useEffect } from "react";

export default function TaskCreateModal({ onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [modules, setModules] = useState([]);

  useEffect(() => {
    fetch("/api/modules")
      .then((r) => r.json())
      .then((res) => setModules(res.data || []))
      .catch(() => {});
  }, []);

  async function submit(e) {
    e.preventDefault();
    const payload = { title, description };
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await res.json();
    if (body.success && onCreated) onCreated(body.data);
  }

  return (
    <form onSubmit={submit}>
      <label>
        Title{" "}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </label>
      <label>
        Description{" "}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      <button type="submit">Create</button>
    </form>
  );
}
