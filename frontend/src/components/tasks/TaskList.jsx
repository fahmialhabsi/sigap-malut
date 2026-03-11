import React, { useEffect, useState } from "react";

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((res) => setTasks(res.data || []))
      .catch(console.error);
  }, []);
  return (
    <div>
      <h3>Task List</h3>
      <ul>
        {tasks.map((t) => (
          <li key={t.id}>
            #{t.id} {t.title} — {t.status}{" "}
            <a href={`/sekretariat/tasks/${t.id}`}>Detail</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
