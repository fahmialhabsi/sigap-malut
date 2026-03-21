// src/tests/DataTabale.test.js

import { render, screen } from "@testing-library/react";
import React from "react";
import AlertList from "../components/ui/AlertList";
import KpiTile from "../components/ui/KpiTile";
import DataTable from "../components/ui/DataTable";

test("render data table dengan data", () => {
  render(
    <DataTable
      columns={[{ Header: "Nama", accessor: "nama" }]}
      data={[{ nama: "Siti" }]}
    />,
  );
  expect(screen.getByText(/Siti/i)).toBeInTheDocument();
});
