import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import ApprovalWorkflowPage from "../pages/ApprovalWorkflowPage";

jest.mock("../services/approvalService", () => ({
  getApprovalWorkflowAPI: jest.fn(() =>
    Promise.resolve({
      data: [
        {
          time: "2026-03-18T10:00:00Z",
          user: "user",
          modulId: "modulA",
          dataId: "data1",
          status: "diajukan",
          detail: "Permintaan approval",
        },
        {
          time: "2026-03-18T11:00:00Z",
          user: "verifikator",
          modulId: "modulA",
          dataId: "data1",
          status: "diverifikasi",
          detail: "Verifikasi data",
        },
      ],
    }),
  ),
  submitForApprovalAPI: jest.fn(() => Promise.resolve()),
  updateApprovalStatusAPI: jest.fn(() => Promise.resolve()),
}));

test("render approval workflow dan ajukan approval", async () => {
  render(<ApprovalWorkflowPage />);
  expect(screen.getByText(/Approval Workflow/)).toBeInTheDocument();
  await waitFor(() => screen.getByText(/Permintaan approval/));
  expect(screen.getByText(/diajukan/)).toBeInTheDocument();
  expect(screen.getByText(/diverifikasi/)).toBeInTheDocument();

  // Ajukan approval
  fireEvent.change(screen.getByPlaceholderText("Modul"), {
    target: { value: "modulB" },
  });
  fireEvent.change(screen.getByPlaceholderText("Data ID"), {
    target: { value: "data2" },
  });
  fireEvent.change(screen.getByPlaceholderText("Detail"), {
    target: { value: "Permintaan baru" },
  });
  fireEvent.click(screen.getByText("Ajukan"));
  await waitFor(() => screen.getByText(/Approval berhasil diajukan/));
});

test("verifikator dapat verifikasi approval", async () => {
  render(<ApprovalWorkflowPage />);
  await waitFor(() => screen.getByText(/Permintaan approval/));
  fireEvent.change(screen.getByLabelText("Role Switch"), {
    target: { value: "verifikator" },
  });
  await waitFor(() => screen.getByText("Verifikasi"));
  fireEvent.click(screen.getByText("Verifikasi"));
  await waitFor(() => screen.getByText(/Status Verifikasi berhasil/));
});

test("approver dapat setujui, tolak, revisi approval", async () => {
  render(<ApprovalWorkflowPage />);
  await waitFor(() => screen.getByText(/Verifikasi data/));
  fireEvent.change(screen.getByLabelText("Role Switch"), {
    target: { value: "approver" },
  });
  await waitFor(() => screen.getByText("Setujui"));
  fireEvent.click(screen.getByText("Setujui"));
  await waitFor(() => screen.getByText(/Status Setujui berhasil/));
  fireEvent.click(screen.getByText("Tolak"));
  await waitFor(() => screen.getByText(/Status Tolak berhasil/));
  fireEvent.click(screen.getByText("Revisi"));
  await waitFor(() => screen.getByText(/Status Revisi berhasil/));
});
