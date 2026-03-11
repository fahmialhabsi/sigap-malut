import React, { useRef, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import useAuthStore from "../stores/authStore";
import { roleIdToName } from "../utils/roleMap";
import DashboardSekretariatLayout from "../layouts/DashboardSekretariatLayout";
import TaskList from "../components/tasks/TaskList";
import TaskDetail from "../components/tasks/TaskDetail";
import TaskCreateModal from "../components/tasks/TaskCreateModal";

function normalizeRoleName(user) {
  return (
    (user?.roleName && String(user.roleName).toLowerCase()) ||
    user?.role ||
    roleIdToName?.[user?.role_id] ||
    roleIdToName?.[String(user?.role_id)] ||
    null
  );
}

/**
 * SekretariatTasksPage
 * Route: /sekretariat/tasks           -> task list
 * Route: /sekretariat/tasks/:id       -> task detail
 */
export default function SekretariatTasksPage() {
  const user = useAuthStore((state) => state.user);
  const userRole = normalizeRoleName(user);
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const refreshRef = useRef(null);

  function handleTaskCreated() {
    if (refreshRef.current) refreshRef.current();
  }

  // Decide if current user can create tasks
  const canCreate = ["sekretaris", "kasubag_umum", "super_admin"].includes(userRole);

  return (
    <DashboardSekretariatLayout>
      <div className="w-full px-6 md:px-12 py-8 space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-black/95 to-slate-900/92 border-2 border-slate-800/85 rounded-2xl p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
              📋 Task Workflow Sekretariat
            </h1>
            <p className="text-slate-300/80 text-sm">
              Kelola dan pantau alur tugas: Sekretaris → Kasubag/Fungsional → Pelaksana/Bendahara
            </p>
          </div>

          {canCreate && (
            <button
              onClick={() => setModalOpen(true)}
              className="px-5 py-2.5 bg-blue-700 hover:bg-blue-600 text-white rounded-xl font-semibold text-sm shadow-lg transition"
            >
              + Buat Tugas Baru
            </button>
          )}
        </div>

        {/* Sub-routes: list vs detail */}
        <Routes>
          <Route
            path="/"
            element={
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6">
                <TaskList
                  userRole={userRole}
                  onRefreshRef={refreshRef}
                />
              </div>
            }
          />
          <Route
            path="/:id"
            element={
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6">
                <TaskDetail
                  userRole={userRole}
                  onBack={() => navigate("/sekretariat/tasks")}
                />
              </div>
            }
          />
        </Routes>

        {/* Create modal */}
        <TaskCreateModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onCreated={handleTaskCreated}
        />
      </div>
    </DashboardSekretariatLayout>
  );
}
