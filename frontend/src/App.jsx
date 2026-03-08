// frontend/src/App.jsx

import React, { useEffect, Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import ReportingWorkflowPage from "./pages/ReportingWorkflowPage";
import CommentWorkflowPage from "./pages/CommentWorkflowPage";
import CaseWorkflowPage from "./pages/CaseWorkflowPage";
import ReminderPage from "./pages/ReminderPage";
const UserManagementPage = lazy(() => import("./pages/UserManagementPage"));

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import GenericCreatePage from "./pages/GenericCreatePage";
import ViewDetailPage from "./pages/ViewDetailPage";
import EditPage from "./pages/EditPage";
import DashboardLayout from "./layouts/DashboardLayout";
import useAuthStore from "./stores/authStore";
import GeneratedRoutes from "./routes/generatedRoutes";
import ChatbotUploadPage from "./pages/ChatbotUploadPage";
import DashboardSekretariat from "./ui/dashboards/DashboardSekretariat";
import DashboardKetersediaan from "./ui/dashboards/DashboardKetersediaan";
import DashboardDistribusi from "./ui/dashboards/DashboardDistribusi";
import DashboardKonsumsi from "./ui/dashboards/DashboardKonsumsi";
import DashboardUPTD from "./ui/dashboards/DashboardUPTD";
import LandingPage from "./pages/LandingPage";
import DashboardSuperAdmin from "./ui/dashboards/DashboardSuperAdmin";
import AuditTrailPage from "./pages/AuditTrailPage";
import WorkflowStatusPage from "./pages/WorkflowStatusPage";
import ApprovalWorkflowPage from "./pages/ApprovalWorkflowPage";
import BksModulePage from "./pages/bidangKonsumsi/BksModulePage";

// PUBLIC dashboard imports
import DashboardPublik from "./ui/dashboards/DashboardPublik";
import DashboardPublikLayout from "./layouts/DashboardPublikLayout";

/**
 * PrivateRoute wrapper ensures user is authenticated before rendering dashboard layout.
 * If not authenticated, navigates to /login.
 */
function PrivateRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // DEBUG: tampilkan status auth setiap kali PrivateRoute dievaluasi
  try {
    // eslint-disable-next-line no-console
    console.log("PrivateRoute:", {
      isAuthenticated,
      token:
        typeof window !== "undefined" ? localStorage.getItem("token") : null,
      user:
        typeof window !== "undefined"
          ? JSON.parse(localStorage.getItem("user"))
          : null,
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log("PrivateRoute debug error", e);
  }

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Jika store belum menganggap user authenticated tapi token ada di localStorage,
  // kemungkinan initAuth sedang berjalan. Tampilkan loading agar tidak redirect prematur.
  if (!isAuthenticated && token) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

function App() {
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<LandingPage />} />

        {/* 100% PUBLIC: Masyarakat / Peneliti / Lainnya */}
        <Route
          path="/dashboard-publik"
          element={
            <DashboardPublikLayout>
              <DashboardPublik />
            </DashboardPublikLayout>
          }
        />

        <Route
          path="/user-management"
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <PrivateRoute>
                <UserManagementPage />
              </PrivateRoute>
            </Suspense>
          }
        />

        <Route
          path="/dashboard/superadmin"
          element={
            <PrivateRoute>
              <DashboardSuperAdmin />
            </PrivateRoute>
          }
        />

        <Route path="/modul/:modul_id" element={<GenericCreatePage />} />

        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/dashboard/sekretariat"
          element={
            <PrivateRoute>
              <DashboardSekretariat />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/ketersediaan"
          element={
            <PrivateRoute>
              <DashboardKetersediaan />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/distribusi"
          element={
            <PrivateRoute>
              <DashboardDistribusi />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/konsumsi"
          element={
            <PrivateRoute>
              <DashboardKonsumsi />
            </PrivateRoute>
          }
        />

        <Route
          path="/konsumsi/:modulUiId"
          element={
            <PrivateRoute>
              <BksModulePage />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard/uptd"
          element={
            <PrivateRoute>
              <DashboardUPTD />
            </PrivateRoute>
          }
        />

        {/* Workflow and Reminder routes */}
        <Route
          path="/reporting-workflow"
          element={
            <PrivateRoute>
              <ReportingWorkflowPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/comment-workflow"
          element={
            <PrivateRoute>
              <CommentWorkflowPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/case-workflow"
          element={
            <PrivateRoute>
              <CaseWorkflowPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/reminder"
          element={
            <PrivateRoute>
              <ReminderPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/module/:moduleId/create"
          element={
            <PrivateRoute>
              <GenericCreatePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/module/:moduleId/view/:id"
          element={
            <PrivateRoute>
              <ViewDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/module/:moduleId/edit/:id"
          element={
            <PrivateRoute>
              <EditPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/module/:moduleId/:id"
          element={
            <PrivateRoute>
              <ViewDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/module/:moduleId/:id/edit"
          element={
            <PrivateRoute>
              <EditPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/chatbot-upload"
          element={
            <PrivateRoute>
              <ChatbotUploadPage />
            </PrivateRoute>
          }
        />

        {GeneratedRoutes({ PrivateRoute })}

        <Route
          path="/audit-trail"
          element={
            <PrivateRoute>
              <AuditTrailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/workflow-status"
          element={
            <PrivateRoute>
              <WorkflowStatusPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/approval-workflow"
          element={
            <PrivateRoute>
              <ApprovalWorkflowPage />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

export default App;
