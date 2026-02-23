import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const roles = [
  { label: "Super Admin", value: "super_admin" },
  { label: "Kepala Dinas Dan Gubernur", value: "gubernur" },
  { label: "Sekretariat Dinas Pangan", value: "sekretaris" },
  {
    label: "Bidang Ketersediaan dan Kerawanan Pangan",
    value: "kepala_bidang_ketersediaan",
  },
  {
    label: "Bidang Distribusi dan Cadangan Pangan",
    value: "kepala_bidang_distribusi",
  },
  {
    label: "Bidang Konsumsi dan Keamanan Pangan",
    value: "kepala_bidang_konsumsi",
  },
  { label: "Balai Pengawasan Mutu dan Keamanan Pangan", value: "kepala_uptd" },
  { label: "Masyarakat / Peneliti / Lainnya", value: "publik" },
];

export default function LandingPage() {
  const [selectedRole, setSelectedRole] = useState(null);
  const navigate = useNavigate();

  const handleContinue = () => {
    if (!selectedRole) return;
    if (selectedRole === "super_admin") {
      navigate("/login?role=super_admin");
    } else if (selectedRole === "gubernur") {
      navigate("/login?role=gubernur");
    } else if (selectedRole === "publik") {
      navigate("/dashboard-publik");
    } else {
      navigate(`/login?role=${selectedRole}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-center mb-2">
          Selamat Datang di SIGAP Malut
        </h1>
        <p className="text-center text-muted mb-4">
          Silakan pilih tipe pengguna untuk melanjutkan:
        </p>
        <div className="flex flex-col gap-3">
          {roles.map((role) => (
            <button
              key={role.value}
              onClick={() => setSelectedRole(role.value)}
              className={`rounded px-4 py-3 font-semibold border transition text-base ${selectedRole === role.value ? "bg-blue-600 text-white border-blue-600" : "bg-white text-blue-600 border-neutral-300 hover:border-blue-600"}`}
            >
              {role.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="mt-4 bg-blue-600 text-white rounded px-6 py-3 font-semibold shadow hover:bg-blue-700 transition disabled:opacity-50"
          onClick={handleContinue}
          disabled={!selectedRole}
        >
          Lanjutkan
        </button>
      </div>
    </div>
  );
}
