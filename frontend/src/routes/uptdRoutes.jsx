import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import UPTDBalaiPengawasanDashboard from "../pages/uptd-balai-pengawasan/Dashboard";
import UPTTknListPage from "../modules/UPT-TKN/ListPage";
import UPTTknFormPage from "../modules/UPT-TKN/FormPage";
import UPTTknDetailPage from "../modules/UPT-TKN/DetailPage";

export default function UptdRoutes() {
  return (
    <Routes>
      <Route
        path="/module/uptd-balai-pengawasan"
        element={
          <ProtectedRoute>
            <UPTDBalaiPengawasanDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/uptd/UPT-TKN"
        element={
          <ProtectedRoute>
            <UPTTknListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/uptd/UPT-TKN/new"
        element={
          <ProtectedRoute>
            <UPTTknFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/uptd/UPT-TKN/edit/:id"
        element={
          <ProtectedRoute>
            <UPTTknFormPage isEdit />
          </ProtectedRoute>
        }
      />
      <Route
        path="/uptd/UPT-TKN/:id"
        element={
          <ProtectedRoute>
            <UPTTknDetailPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
