// frontend/src/routes/konsumsiRoutes.jsx

import React from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute"; // sesuaikan path Anda
import BksModulePage from "../pages/bidangKonsumsi/BksModulePage";

export default function KonsumsiRoutes() {
  return (
    <Route
      path="/konsumsi/:modulUiId"
      element={
        <ProtectedRoute>
          <BksModulePage />
        </ProtectedRoute>
      }
    />
  );
}
