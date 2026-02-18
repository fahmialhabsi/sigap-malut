import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ModulePage from "./pages/ModulePage";
import BKTPGDCreatePage from "./pages/BKTPGDCreatePage";
import BKTKRWCreatePage from "./pages/BKTKRWCreatePage";
import BDSHRGCreatePage from "./pages/BDSHRGCreatePage";
import SEKADMCreatePage from "./pages/SEKADMCreatePage";
import SEKKEPCreatePage from "./pages/SEKKEPCreatePage";
import SEKKEUCreatePage from "./pages/SEKKEUCreatePage";
import ViewDetailPage from "./pages/ViewDetailPage"; // ← NEW
import EditPage from "./pages/EditPage"; // ← NEW
import DashboardLayout from "./layouts/DashboardLayout";
import useAuthStore from "./stores/authStore";

function PrivateRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

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

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />

        {/* Module List */}
        <Route
          path="/module/:moduleId"
          element={
            <PrivateRoute>
              <ModulePage />
            </PrivateRoute>
          }
        />

        {/* Create Pages */}
        <Route
          path="/module/bkt-pgd/create"
          element={
            <PrivateRoute>
              <BKTPGDCreatePage />
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
          path="/module/bds-hrg/create"
          element={
            <PrivateRoute>
              <BDSHRGCreatePage />
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

        {/* View Detail - GENERIC for all modules */}
        <Route
          path="/module/:moduleId/:id"
          element={
            <PrivateRoute>
              <ViewDetailPage />
            </PrivateRoute>
          }
        />

        {/* Edit Page - GENERIC for all modules */}
        <Route
          path="/module/:moduleId/:id/edit"
          element={
            <PrivateRoute>
              <EditPage />
            </PrivateRoute>
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
