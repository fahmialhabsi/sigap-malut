import { render, screen } from "@testing-library/react";
import React from "react";
import AlertList from "../components/ui/AlertList";

test("render alert list dengan alert", () => {
  render(
    <AlertList
      alerts={[
        {
          id: "a1",
          severity: "critical",
          title: "KGB Terlambat",
          summary: "Terlewat 59 hari",
        },
      ]}
    />,
  );
  expect(screen.getByText(/KGB Terlambat/)).toBeInTheDocument();
  expect(screen.getByText(/Terlewat 59 hari/)).toBeInTheDocument();
});
