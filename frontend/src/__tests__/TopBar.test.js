import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TopBar from "../components/base/TopBar";

describe("TopBar", () => {
  it("renders role switch and high contrast toggle", () => {
    render(
      <MemoryRouter>
        <TopBar />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText(/Role Switch/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Toggle High Contrast Mode/i),
    ).toBeInTheDocument();
  });

  it("toggles high contrast mode", () => {
    render(
      <MemoryRouter>
        <TopBar />
      </MemoryRouter>,
    );
    const toggleBtn = screen.getByLabelText(/Toggle High Contrast Mode/i);
    fireEvent.click(toggleBtn);
    expect(document.documentElement.classList.contains("high-contrast")).toBe(
      true,
    );
    fireEvent.click(toggleBtn);
    expect(document.documentElement.classList.contains("high-contrast")).toBe(
      false,
    );
  });
});
