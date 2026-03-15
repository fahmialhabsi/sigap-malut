import React, { Suspense, lazy } from "react";
import { useParams, useLocation, Navigate } from "react-router-dom";

// Mapping modulId ke nama folder modul
const modulMap = {
  "UPT-TKN": "UPT-TKN",
  "UPT-ADM": "UPT-ADM",
  "UPT-KEU": "UPT-KEU",
  "UPT-KEP": "UPT-KEP",
  "UPT-AST": "UPT-AST",
  "UPT-MTU": "UPT-MTU",
  "UPT-INS": "UPT-INS",
};

function getModuleComponent(modulId) {
  const folder = modulMap[modulId?.toUpperCase()];
  if (!folder) return null;
  // ListPage sebagai default, bisa dikembangkan untuk FormPage/DetailPage
  return lazy(() => import(`../modules/${folder}/ListPage.jsx`));
}

export default function UptdModulePage() {
  const { modulId } = useParams();
  const location = useLocation();
  const folder = modulMap[modulId?.toUpperCase()];
  if (!folder) return <Navigate to="/dashboard/uptd" replace />;

  // Routing dinamis: pastikan persis /uptd/UPT-TKN (tanpa slash di belakang) memuat ListPage
  let PageComponent = null;
  const pathParts = location.pathname.split("/").filter(Boolean);
  // pathParts: ["uptd", "UPT-TKN"] => ListPage
  // pathParts: ["uptd", "UPT-TKN", "new"] => FormPage
  // pathParts: ["uptd", "UPT-TKN", "edit", ":id"] => FormPage
  // pathParts: ["uptd", "UPT-TKN", ":id"] => DetailPage
  if (pathParts.length === 3 && pathParts[2] === "new") {
    PageComponent = lazy(() => import(`../modules/${folder}/FormPage.jsx`));
  } else if (pathParts.length === 4 && pathParts[2] === "edit") {
    PageComponent = lazy(() => import(`../modules/${folder}/FormPage.jsx`));
  } else if (pathParts.length === 3 && pathParts[2] !== "new") {
    PageComponent = lazy(() => import(`../modules/${folder}/DetailPage.jsx`));
  } else if (pathParts.length === 2) {
    // /uptd/UPT-TKN
    PageComponent = getModuleComponent(modulId);
  } else {
    PageComponent = getModuleComponent(modulId);
  }

  if (!PageComponent) return <Navigate to="/dashboard/uptd" replace />;

  return (
    <Suspense fallback={<div>Loading modul...</div>}>
      <PageComponent />
    </Suspense>
  );
}
