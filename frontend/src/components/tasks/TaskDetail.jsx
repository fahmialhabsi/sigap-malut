import React, { useEffect, useState } from "react";

export default function TaskDetail({ id }) {
  const [task, setTask] = useState(null);
  useEffect(() => {
    if (!id) return;
    fetch(`/api/tasks/${id}`)
      .then((r) => r.json())
      .then((res) => setTask(res.data))
      .catch(console.error);
  }, [id]);

  if (!task) return <div>Loading...</div>;
  return (
    <div>
      <h3>
        Task {task.id}: {task.title}
      </h3>
      <p>{task.description}</p>
      <p>Status: {task.status}</p>
      <h4>Logs</h4>
      <ul>
        {(task.TaskLogs || []).map((l) => (
          <li key={l.id}>
            {l.action} by {l.actor_id} at {l.created_at}: {l.note}
          </li>
        ))}
      </ul>
    </div>
  );
}
