import React from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import UPTDBalaiPengawasanDashboard from "../pages/uptd-balai-pengawasan/Dashboard";

export default function UptdRoutes() {
  return (
    <Route
      path="/module/uptd-balai-pengawasan"
      element={
        <ProtectedRoute>
          <UPTDBalaiPengawasanDashboard />
        </ProtectedRoute>
      }
    />
  );
}
