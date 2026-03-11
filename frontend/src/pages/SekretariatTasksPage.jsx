import React, { useEffect, useState } from "react";

export default function SekretariatTasksPage() {
  const [tasks, setTasks] = useState([]);
  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((res) => setTasks(res.data || []))
      .catch(console.error);
  }, []);

  return (
    <div>
      <h2>Tasks (Sekretariat)</h2>
      <a
        href="#create"
        onClick={() => window.alert("Use TaskCreate modal - not wired in demo")}
      >
        + Create task
      </a>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Status</th>
            <th>Due</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.title}</td>
              <td>{t.status}</td>
              <td>{t.due_date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
