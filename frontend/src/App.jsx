import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
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

function PrivateRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  // Tunggu inisialisasi selesai
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
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

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard/superadmin" element={<DashboardSuperAdmin />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />
      <Route path="/dashboard" element={<Navigate to="/" replace />} />
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
        path="/dashboard/uptd"
        element={
          <PrivateRoute>
            <DashboardUPTD />
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
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
