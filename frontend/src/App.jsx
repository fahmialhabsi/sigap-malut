import FungsionalKetersediaanDashboard from "./pages/dashboard/fungsional-ketersediaan";
import FungsionalDistribusiDashboard from "./pages/dashboard/fungsional-distribusi";
import FungsionalKonsumsiDashboard from "./pages/dashboard/fungsional-konsumsi";
import FungsionalUPTDDashboard from "./pages/dashboard/fungsional-uptd";
import FungsionalUPTDMutuDashboard from "./pages/dashboard/fungsional-uptd-mutu";
import FungsionalUPTDTeknisDashboard from "./pages/dashboard/fungsional-uptd-teknis";
import FungsionalPerencanaanDashboard from "./pages/dashboard/fungsional-perencanaan";
import FungsionalKeuanganDashboard from "./pages/dashboard/fungsional-keuangan";
// frontend/src/App.jsx

import React, { useEffect, useState, Suspense, lazy } from "react";
import useAuthStore from "./stores/authStore";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AlertsToast from "./components/realtime/AlertsToast";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
const UserManagementPage = lazy(() => import("./pages/UserManagementPage.jsx"));
import GenericCreatePage from "./pages/GenericCreatePage";
import ViewDetailPage from "./pages/ViewDetailPage";
import EditPage from "./pages/EditPage";
import MasterDataSyncPanel from "./components/MasterDataSyncPanel.jsx";
import IntegrationLogPanel from "./components/IntegrationLogPanel.jsx";
import ChatbotUploadPage from "./pages/ChatbotUploadPage";
import AuditTrailPage from "./pages/AuditTrailPage";
import WorkflowStatusPage from "./pages/WorkflowStatusPage";
import ApprovalWorkflowPage from "./pages/ApprovalWorkflowPage";
import BksModulePage from "./pages/bidangKonsumsi/BksModulePage";
import SekretariatTasksPage from "./pages/SekretariatTasksPage";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardPage from "./pages/DashboardPage";
import DashboardSekretariat from "./ui/dashboards/DashboardSekretariat";
import DashboardKetersediaan from "./ui/dashboards/DashboardKetersediaan";
import DashboardDistribusi from "./ui/dashboards/DashboardDistribusi";
import DashboardKonsumsi from "./ui/dashboards/DashboardKonsumsi";
import DashboardUPTD from "./ui/dashboards/DashboardUPTD";
import DashboardGubernur from "./ui/dashboards/DashboardGubernur";
import DashboardKepalaDinas from "./ui/dashboards/DashboardKepalaDinas";
import DashboardFungsional from "./ui/dashboards/DashboardFungsional";
import DashboardKasubag from "./ui/dashboards/DashboardKasubag";
import DashboardBendaharaPengeluaran from "./ui/dashboards/DashboardBendaharaPengeluaran";
import DashboardBendaharaGaji from "./ui/dashboards/DashboardBendaharaGaji";
import DashboardBendaharaBarang from "./ui/dashboards/DashboardBendaharaBarang";
import DashboardPelaksana from "./ui/dashboards/DashboardPelaksana";
import PelaksanaSekretariat from "./pages/dashboard/pelaksana-sekretariat";
import PelaksanaKetersediaan from "./pages/dashboard/pelaksana-ketersediaan";
import PelaksanaDistribusi from "./pages/dashboard/pelaksana-distribusi";
import PelaksanaKonsumsi from "./pages/dashboard/pelaksana-konsumsi";
import PelaksanaUPTD from "./pages/dashboard/pelaksana-uptd";
import DashboardKasubagUPTD from "./ui/dashboards/DashboardKasubagUPTD";
import DashboardKasiUPTD from "./ui/dashboards/DashboardKasiUPTD";
import DashboardKasiMutu from "./ui/dashboards/DashboardKasiMutu";
import DashboardKasiTeknis from "./ui/dashboards/DashboardKasiTeknis";
import DashboardInflasi from "./ui/dashboards/DashboardInflasi";
import LaporanMendagriPage from "./pages/LaporanMendagriPage";
import DashboardKepegawaian from "./ui/dashboards/DashboardKepegawaian";
import DashboardKeuangan from "./ui/dashboards/DashboardKeuangan";
import DashboardKomoditas from "./ui/dashboards/DashboardKomoditas";
import DashboardSuperAdmin from "./ui/dashboards/DashboardSuperAdmin";
import ReportingWorkflowPage from "./pages/ReportingWorkflowPage";
import CommentWorkflowPage from "./pages/CommentWorkflowPage";
import CaseWorkflowPage from "./pages/CaseWorkflowPage";
import ReminderPage from "./pages/ReminderPage";
import InboxSuratMasukPage from "./pages/surat/InboxSuratMasukPage";
import UploadSuratMasukPage from "./pages/surat/UploadSuratMasukPage";
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
import ErrorBoundary from "./components/ErrorBoundary";
import RoleProtectedRoute from "./routes/RoleProtectedRoute";
import GeneratedRoutes from "./routes/generatedRoutes";
import { fetchRoles } from "./services/roleService";
import { initRoleMaps } from "./utils/roleMap";

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

  console.log("PRIVATE ROUTE → isInitialized:", isInitialized);
  console.log("PRIVATE ROUTE → isAuthenticated:", isAuthenticated);

  // Jika proses inisialisasi auth belum selesai, tampilkan loading agar tidak redirect prematur.
  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

const ANALYTICS_ALLOWED_ROLES = [
  "super_admin",
  "kepala_dinas",
  "gubernur",
  "sekretaris",
  "kepala_bidang",
  "kepala_bidang_ketersediaan",
  "kepala_bidang_distribusi",
  "kepala_bidang_konsumsi",
  "kepala_uptd",
  "kasubag",
  "kasubbag_umum_kepegawaian",
  "kasubbag",
  "kasubbag_umum",
  "kasubbag_tu_uptd",
  "kasi_mutu_uptd",
  "kasi_teknis_uptd",
  "kasi_uptd",
  "fungsional",
  "fungsional_analis",
  "fungsional_perencana",
  "fungsional_ketersediaan",
  "fungsional_distribusi",
  "fungsional_konsumsi",
  "jabatan_fungsional",
  "pejabat_fungsional",
  "bendahara",
];

function AnalyticsRoute({ children }) {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  if (!isInitialized) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const role = String(user?.role || user?.roleName || "").toLowerCase();
  if (!ANALYTICS_ALLOWED_ROLES.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

function App() {
  const initAuth = useAuthStore((state) => state.initAuth);
  const [rolesInitialized, setRolesInitialized] = useState(false);

  useEffect(() => {
    // Inisialisasi mapping roleIdToName dari backend sebelum initAuth
    (async () => {
      try {
        const roles = await fetchRoles();
        initRoleMaps(roles);
      } catch (err) {
        console.error("Gagal inisialisasi role mapping:", err);
      }
      setRolesInitialized(true);
      initAuth();
    })();
  }, [initAuth]);

  // Auto-logout idle >15 menit (13-System-Architecture-Document.md)
  useIdleLogout();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!rolesInitialized) {
    return <div>Loading roles...</div>;
  }

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
              <ErrorBoundary>
                <DashboardPublik />
              </ErrorBoundary>
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
              <ErrorBoundary>
                <DashboardSuperAdmin />
                <MasterDataSyncPanel />
                <IntegrationLogPanel />
              </ErrorBoundary>
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
              <ErrorBoundary>
                <DashboardSekretariat />
              </ErrorBoundary>
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/ketersediaan"
          element={
            <PrivateRoute>
              <ErrorBoundary>
                <DashboardKetersediaan />
              </ErrorBoundary>
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/distribusi"
          element={
            <PrivateRoute>
              <ErrorBoundary>
                <DashboardDistribusi />
              </ErrorBoundary>
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/konsumsi"
          element={
            <PrivateRoute>
              <ErrorBoundary>
                <DashboardKonsumsi />
              </ErrorBoundary>
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
              <ErrorBoundary>
                <DashboardUPTD />
              </ErrorBoundary>
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard/gubernur"
          element={
            <PrivateRoute>
              <ErrorBoundary>
                <DashboardGubernur />
              </ErrorBoundary>
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard/kepala-dinas"
          element={
            <PrivateRoute>
              <ErrorBoundary>
                <DashboardKepalaDinas />
              </ErrorBoundary>
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
        {/* ROUTE KHUSUS DASHBOARD FUNGSIONAL PER SUB-ROLE */}
        <Route
          path="/dashboard/fungsional-ketersediaan"
          element={
            <PrivateRoute>
              <FungsionalKetersediaanDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/fungsional-distribusi"
          element={
            <PrivateRoute>
              <FungsionalDistribusiDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/fungsional-konsumsi"
          element={
            <PrivateRoute>
              <FungsionalKonsumsiDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/fungsional-uptd"
          element={
            <PrivateRoute>
              <FungsionalUPTDDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/fungsional-uptd-mutu"
          element={
            <PrivateRoute>
              <FungsionalUPTDMutuDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/fungsional-uptd-teknis"
          element={
            <PrivateRoute>
              <FungsionalUPTDTeknisDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/fungsional-perencanaan"
          element={
            <PrivateRoute>
              <FungsionalPerencanaanDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/fungsional-keuangan"
          element={
            <PrivateRoute>
              <FungsionalKeuanganDashboard />
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
          path="/dashboard/bendahara-pengeluaran"
          element={
            <PrivateRoute>
              <RoleProtectedRoute
                allowedRoles={[
                  "bendahara",
                  "bendahara_pengeluaran",
                  "bendahara_gaji",
                  "super_admin",
                  "sekretaris",
                  "kepala_dinas",
                ]}
              >
                <DashboardBendaharaPengeluaran />
              </RoleProtectedRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/bendahara-gaji"
          element={
            <PrivateRoute>
              <RoleProtectedRoute
                allowedRoles={[
                  "bendahara_gaji",
                  "super_admin",
                  "sekretaris",
                  "kepala_dinas",
                ]}
              >
                <DashboardBendaharaGaji />
              </RoleProtectedRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/bendahara-barang"
          element={
            <PrivateRoute>
              <RoleProtectedRoute
                allowedRoles={[
                  "bendahara_barang",
                  "super_admin",
                  "sekretaris",
                  "kepala_dinas",
                ]}
              >
                <DashboardBendaharaBarang />
              </RoleProtectedRoute>
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
          path="/dashboard/pelaksana-sekretariat"
          element={
            <PrivateRoute>
              <PelaksanaSekretariat />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/pelaksana-ketersediaan"
          element={
            <PrivateRoute>
              <PelaksanaKetersediaan />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/pelaksana-distribusi"
          element={
            <PrivateRoute>
              <PelaksanaDistribusi />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/pelaksana-konsumsi"
          element={
            <PrivateRoute>
              <PelaksanaKonsumsi />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/pelaksana-uptd"
          element={
            <PrivateRoute>
              <PelaksanaUPTD />
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
          path="/dashboard/kasi-mutu"
          element={
            <PrivateRoute>
              <DashboardKasiMutu />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/kasi-teknis"
          element={
            <PrivateRoute>
              <DashboardKasiTeknis />
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

        {/* Self-service analytics filter (05-Dashboard-Template-Standar.md)
            Accessible by: fungsional*, kasubag*, kasi*, kepala_*, sekretaris, super_admin */}
        <Route
          path="/analytics"
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <AnalyticsRoute>
                <SelfServiceAnalyticsPage />
              </AnalyticsRoute>
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
