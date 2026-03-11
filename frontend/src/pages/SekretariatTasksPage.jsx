// frontend/src/pages/SekretariatTasksPage.jsx
import React, { useState } from "react";
import TaskList from "../components/tasks/TaskList";
import TaskDetail from "../components/tasks/TaskDetail";
import TaskCreateModal from "../components/tasks/TaskCreateModal";

export default function SekretariatTasksPage() {
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const filter = {};
  if (statusFilter) filter.status = statusFilter;

  const handleCreated = () => {
    setRefreshKey((k) => k + 1);
  };

  if (selectedTaskId) {
    return (
      <div className="min-h-screen bg-slate-50">
        <TaskDetail
          taskId={selectedTaskId}
          onBack={() => setSelectedTaskId(null)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Kotak Masuk Tugas</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Kelola tugas sekretariat, bidang, dan UPTD
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 shadow"
          >
            + Buat Tugas
          </button>
        </div>

        {/* Filter bar */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-4 flex gap-3 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="">Semua Status</option>
            {["open", "assigned", "accepted", "submitted", "verified", "reviewed", "closed", "rejected"].map(
              (s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ),
            )}
          </select>
        </div>

        {/* Task list */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <TaskList
            key={refreshKey}
            filter={filter}
            onSelect={(task) => setSelectedTaskId(task.id)}
          />
        </div>
      </div>

      {showCreate && (
        <TaskCreateModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
