// utils/reminder.js
// Workflow Monitoring & Reminder otomatis
export function addReminder({ user, modulId, dataId, pesan, dueDate }) {
  const now = new Date().toISOString();
  const entry = {
    user: user?.username,
    modulId,
    dataId,
    pesan,
    dueDate,
    created: now,
    status: "open",
  };
  const logs = JSON.parse(localStorage.getItem("reminderLogs") || "[]");
  logs.push(entry);
  localStorage.setItem("reminderLogs", JSON.stringify(logs));
}

export function getReminders() {
  return JSON.parse(localStorage.getItem("reminderLogs") || "[]");
}

export function completeReminder(index) {
  const logs = JSON.parse(localStorage.getItem("reminderLogs") || "[]");
  if (logs[index]) logs[index].status = "done";
  localStorage.setItem("reminderLogs", JSON.stringify(logs));
}

export function clearReminders() {
  localStorage.removeItem("reminderLogs");
}
