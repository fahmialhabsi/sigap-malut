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
import ModulePage from "./pages/ModulePage";
import GenericCreatePage from "./pages/GenericCreatePage";
import SEKADMCreatePage from "./pages/SEKADMCreatePage";
import SEKASTCreatePage from "./pages/SEKASTCreatePage";
import SEKHUMCreatePage from "./pages/SEKHUMCreatePage";
import SEKKBJCreatePage from "./pages/SEKKBJCreatePage";
import SEKKEPCreatePage from "./pages/SEKKEPCreatePage";
import SEKKEUCreatePage from "./pages/SEKKEUCreatePage";
import SEKLDSCreatePage from "./pages/SEKLDSCreatePage";
import SEKLKSCreatePage from "./pages/SEKLKSCreatePage";
import SEKLKTCreatePage from "./pages/SEKLKTCreatePage";
import SEKLUPCreatePage from "./pages/SEKLUPCreatePage";
import SEKRENCreatePage from "./pages/SEKRENCreatePage";
import SEKRMHCreatePage from "./pages/SEKRMHCreatePage";
import BKTPGDCreatePage from "./pages/BKTPGDCreatePage";
import BKTKBJCreatePage from "./pages/BKTKBJCreatePage";
import BKTKRWCreatePage from "./pages/BKTKRWCreatePage";
import BKTMEVCreatePage from "./pages/BKTMEVCreatePage";
import BKTFSLCreatePage from "./pages/BKTFSLCreatePage";
import BKTBMBCreatePage from "./pages/BKTBMBCreatePage";
import BDSHRGCreatePage from "./pages/BDSHRGCreatePage";
import BDSCPDCreatePage from "./pages/BDSCPDCreatePage";
import BDSMONCreatePage from "./pages/BDSMONCreatePage";
import BDSKBJCreatePage from "./pages/BDSKBJCreatePage";
import BDSBMBCreatePage from "./pages/BDSBMBCreatePage";
import BDSEVLCreatePage from "./pages/BDSEVLCreatePage";
import BDSLAPCreatePage from "./pages/BDSLAPCreatePage";
import BKSKBJCreatePage from "./pages/BKSKBJCreatePage";
import BKSDVRCreatePage from "./pages/BKSDVRCreatePage";
import BKSKMNCreatePage from "./pages/BKSKMNCreatePage";
import BKSBMBCreatePage from "./pages/BKSBMBCreatePage";
import BKSEVLCreatePage from "./pages/BKSEVLCreatePage";
import BKSLAPCreatePage from "./pages/BKSLAPCreatePage";
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
import UptdModulePage from "./pages/UptdModulePage";
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
        <Route
          path="/uptd/:modulId/*"
          element={
            <PrivateRoute>
              <UptdModulePage />
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
          path="/module/sek-adm/create"
          element={
            <PrivateRoute>
              <SEKADMCreatePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/module/sek-kep/create"
          element={
            <PrivateRoute>
              <SEKKEPCreatePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/module/sek-keu/create"
          element={
            <PrivateRoute>
              <SEKKEUCreatePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/module/sek-ast/create"
          element={
            <PrivateRoute>
              <SEKASTCreatePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/module/sek-rmh/create"
          element={
            <PrivateRoute>
              <SEKRMHCreatePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/module/sek-hum/create"
          element={
            <PrivateRoute>
              <SEKHUMCreatePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/module/sek-ren/create"
          element={
            <PrivateRoute>
              <SEKRENCreatePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/module/sek-kbj/create"
          element={
            <PrivateRoute>
              <SEKKBJCreatePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/module/sek-lkt/create"
          element={
            <PrivateRoute>
              <SEKLKTCreatePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/module/sek-lds/create"
          element={
            <PrivateRoute>
              <SEKLDSCreatePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/module/sek-lks/create"
          element={
            <PrivateRoute>
              <SEKLKSCreatePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/module/sek-lup/create"
          element={
            <PrivateRoute>
              <SEKLUPCreatePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/module/bkt-pgd/create"
          element={
            <PrivateRoute>
              <BKTPGDCreatePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/module/bkt-kbj/create"
          element={
            <PrivateRoute>
              <BKTKBJCreatePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/module/bkt-krw/create"
          element={
            <PrivateRoute>
              <BKTKRWCreatePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/module/bkt-mev/create"
          element={
            <PrivateRoute>
              <BKTMEVCreatePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/module/bkt-fsl/create"
          element={
            <PrivateRoute>
              <BKTFSLCreatePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/module/bkt-bmb/create"
          element={
            <PrivateRoute>
              <BKTBMBCreatePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/module/bds-hrg/create"
          element={
            <PrivateRoute>
              <BDSHRGCreatePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/module/bds-cpd/create"
          element={
            <PrivateRoute>
              <BDSCPDCreatePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/module/bds-mon/create"
          element={
            <PrivateRoute>
              <BDSMONCreatePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/module/bds-kbj/create"
          element={
            <PrivateRoute>
              <BDSKBJCreatePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/module/bds-bmb/create"
          element={
            <PrivateRoute>
              <BDSBMBCreatePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/module/bds-evl/create"
          element={
            <PrivateRoute>
              <BDSEVLCreatePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/module/bds-lap/create"
          element={
            <PrivateRoute>
              <BDSLAPCreatePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/module/bks-kbj/create"
          element={
            <PrivateRoute>
              <BKSKBJCreatePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/module/bks-dvr/create"
          element={
            <PrivateRoute>
              <BKSDVRCreatePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/module/bks-kmn/create"
          element={
            <PrivateRoute>
              <BKSKMNCreatePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/module/bks-bmb/create"
          element={
            <PrivateRoute>
              <BKSBMBCreatePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/module/bks-evl/create"
          element={
            <PrivateRoute>
              <BKSEVLCreatePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/module/bks-lap/create"
          element={
            <PrivateRoute>
              <BKSLAPCreatePage />
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
          path="/module/:moduleId"
          element={
            <PrivateRoute>
              <ModulePage />
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
