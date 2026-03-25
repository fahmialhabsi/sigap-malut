// frontend/src/App.jsx

import React, { useEffect, Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AlertsToast from "./components/realtime/AlertsToast";

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
import DashboardGubernur from "./ui/dashboards/DashboardGubernur";
import DashboardInflasi from "./ui/dashboards/DashboardInflasi";
import DashboardKepegawaian from "./ui/dashboards/DashboardKepegawaian";
import DashboardKeuangan from "./ui/dashboards/DashboardKeuangan";
import DashboardKomoditas from "./ui/dashboards/DashboardKomoditas";
import LandingPage from "./pages/LandingPage";
import DashboardSuperAdmin from "./ui/dashboards/DashboardSuperAdmin";
import DashboardKepalaDinas from "./ui/dashboards/DashboardKepalaDinas";
import DashboardFungsional from "./ui/dashboards/DashboardFungsional";
import DashboardKasubag from "./ui/dashboards/DashboardKasubag";
import DashboardBendahara from "./ui/dashboards/DashboardBendahara";
import DashboardPelaksana from "./ui/dashboards/DashboardPelaksana";
import DashboardKasubagUPTD from "./ui/dashboards/DashboardKasubagUPTD";
import DashboardKasiUPTD from "./ui/dashboards/DashboardKasiUPTD";
import MasterDataSyncPanel from "./components/MasterDataSyncPanel.jsx";
import IntegrationLogPanel from "./components/IntegrationLogPanel.jsx";
import AuditTrailPage from "./pages/AuditTrailPage";
import WorkflowStatusPage from "./pages/WorkflowStatusPage";
import ApprovalWorkflowPage from "./pages/ApprovalWorkflowPage";
import BksModulePage from "./pages/bidangKonsumsi/BksModulePage";
import SekretariatTasksPage from "./pages/SekretariatTasksPage";
import LaporanMendagriPage from "./pages/LaporanMendagriPage";
import UploadSuratMasukPage from "./pages/surat/UploadSuratMasukPage";
import InboxSuratMasukPage from "./pages/surat/InboxSuratMasukPage";
import DetailSuratMasukPage from "./pages/surat/DetailSuratMasukPage";
import FormDisposisiPage from "./pages/surat/FormDisposisiPage";
import SuratKeluarPage from "./pages/surat/SuratKeluarPage";
import FormSuratKeluarPage from "./pages/surat/FormSuratKeluarPage";
import useIdleLogout from "./hooks/useIdleLogout";
const SelfServiceAnalyticsPage = lazy(
  () => import("./pages/SelfServiceAnalyticsPage"),
);
const ModuleWizardPage = lazy(() => import("./pages/ModuleWizardPage"));

// PUBLIC dashboard imports
import DashboardPublik from "./ui/dashboards/DashboardPublik";
import DashboardPublikLayout from "./layouts/DashboardPublikLayout";

/**
 * PrivateRoute wrapper ensures user is authenticated before rendering dashboard layout.
 * If not authenticated, navigates to /login.
 *
 * This version uses `isInitialized` from authStore to avoid premature redirects
 * while `initAuth()` is still populating the store from localStorage / backend.
 */
function PrivateRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  // Jika proses inisialisasi auth belum selesai, tampilkan loading agar tidak redirect prematur.
  if (!isInitialized) {
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

  // Auto-logout idle >15 menit (13-System-Architecture-Document.md)
  useIdleLogout();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          style: { fontFamily: "inherit", fontSize: "0.875rem" },
        }}
      />
      <AlertsToast />
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
              <MasterDataSyncPanel />
              <IntegrationLogPanel />
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

        <Route
          path="/dashboard/gubernur"
          element={
            <PrivateRoute>
              <DashboardGubernur />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard/kepala-dinas"
          element={
            <PrivateRoute>
              <DashboardKepalaDinas />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard/fungsional"
          element={
            <PrivateRoute>
              <DashboardFungsional />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/kasubag"
          element={
            <PrivateRoute>
              <DashboardKasubag />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/bendahara"
          element={
            <PrivateRoute>
              <DashboardBendahara />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/pelaksana"
          element={
            <PrivateRoute>
              <DashboardPelaksana />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/kasubag-uptd"
          element={
            <PrivateRoute>
              <DashboardKasubagUPTD />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/kasi-uptd"
          element={
            <PrivateRoute>
              <DashboardKasiUPTD />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard/inflasi"
          element={
            <PrivateRoute>
              <DashboardInflasi />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard/inflasi/mendagri"
          element={
            <PrivateRoute>
              <LaporanMendagriPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard/kepegawaian"
          element={
            <PrivateRoute>
              <DashboardKepegawaian />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard/keuangan"
          element={
            <PrivateRoute>
              <DashboardKeuangan />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard/komoditas"
          element={
            <PrivateRoute>
              <DashboardKomoditas />
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

        <Route
          path="/tasks"
          element={
            <PrivateRoute>
              <SekretariatTasksPage />
            </PrivateRoute>
          }
        />

        {/* Surat Menyurat (e-Office M011-M013) */}
        <Route
          path="/surat/masuk"
          element={
            <PrivateRoute>
              <InboxSuratMasukPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/surat/masuk/upload"
          element={
            <PrivateRoute>
              <UploadSuratMasukPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/surat/masuk/:id"
          element={
            <PrivateRoute>
              <DetailSuratMasukPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/surat/masuk/:id/disposisi"
          element={
            <PrivateRoute>
              <FormDisposisiPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/surat/keluar"
          element={
            <PrivateRoute>
              <SuratKeluarPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/surat/keluar/baru"
          element={
            <PrivateRoute>
              <FormSuratKeluarPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/surat/keluar/:id/edit"
          element={
            <PrivateRoute>
              <FormSuratKeluarPage />
            </PrivateRoute>
          }
        />

        {/* Self-service analytics filter (05-Dashboard-Template-Standar.md) */}
        <Route
          path="/analytics"
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <PrivateRoute>
                <SelfServiceAnalyticsPage />
              </PrivateRoute>
            </Suspense>
          }
        />

        {/* Module Wizard — buat modul baru (03-dashboard-uiux.md) */}
        <Route
          path="/module-wizard"
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <PrivateRoute>
                <ModuleWizardPage />
              </PrivateRoute>
            </Suspense>
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

export default App;
