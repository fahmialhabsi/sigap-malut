// src/tests/KpiTile.test.js
import { render, screen } from "@testing-library/react";
import React from "react";
import AlertList from "../components/ui/AlertList";
import KpiTile from "../components/ui/KpiTile";
import DataTable from "../components/ui/DataTable";

test("render KPI tile dengan label dan nilai", () => {
  render(<KpiTile label="Compliance" value={0.94} unit="ratio" />);
  expect(screen.getByText(/Compliance/i)).toBeInTheDocument();
  expect(screen.getByText(/0.94/)).toBeInTheDocument();
});
