import React, { useState } from "react";
import { createItem, updateItem } from "./api";
import FormField from "../../components/FormField";
import PageLayout from "../../components/PageLayout";
import { useNavigate } from "react-router-dom";
import fields from "../../../../master-data/FIELDS_UPT-TKN.json";

// Dummy data layanan, ganti dengan fetch ke master layanan jika sudah ada
const layananOptions = [
  { id: "LY132", label: "Pengujian Sampel" },
  { id: "LY133", label: "Audit Produk" },
  { id: "LY134", label: "Sertifikasi" },
  { id: "LY135", label: "Pelaporan Teknis" },
];

export default function FormPage({ isEdit, initialData = {} }) {
  const [form, setForm] = useState(initialData);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  // Daftar field yang wajib diisi (not null)
  const requiredFields = ["layanan_id", "jenis_layanan_teknis", "pelaksana"];

  function handleChange(e) {
    const { name, value, type, files } = e.target;
    setForm((f) => ({ ...f, [name]: type === "file" ? files[0] : value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    // Validasi field wajib
    for (const field of requiredFields) {
      if (!form[field] || form[field] === "") {
        setError(
          "Field '" + field.replace(/_/g, " ").toUpperCase() + "' wajib diisi.",
        );
        return;
      }
    }
    // Hapus field auto-populate dari data yang dikirim
    const autoFields = ["created_by", "created_at", "updated_at"];
    const cleanForm = { ...form };
    autoFields.forEach((f) => delete cleanForm[f]);
    // Debug: tampilkan isi form sebelum submit
    console.log("Data yang dikirim ke backend:", cleanForm);
    setError("");
    if (isEdit) {
      updateItem(cleanForm.id, cleanForm)
        .then(() => navigate("/" + "upt-tkn"))
        .catch((err) => {
          setError("Gagal menyimpan data. Pastikan semua field sudah benar.");
        });
    } else {
      createItem(cleanForm)
        .then(() => navigate("/" + "upt-tkn"))
        .catch((err) => {
          setError("Gagal menyimpan data. Pastikan semua field sudah benar.");
        });
    }
  }

  // --- Deklarasi rendering field di sini ---
  let pelaksanaRendered = false;
  // Sembunyikan field auto-populate dari form
  const autoHideFields = ["created_by", "created_at", "updated_at"];
  const renderedFields = fields
    .filter((f) => !autoHideFields.includes(f.field_name))
    .map((field) => {
      const autoFields = [
        "id",
        "nomor_pengujian",
        "nomor_audit",
        "nomor_sertifikat",
      ];
      const isAutoButRequired =
        autoFields.includes(field.field_name) &&
        requiredFields.includes(field.field_name);
      if (
        !isEdit &&
        autoFields.includes(field.field_name) &&
        !isAutoButRequired
      )
        return null;

      // Khusus layanan_id: select value ID
      if (field.field_name === "layanan_id") {
        return (
          <div key={field.field_name} className="flex flex-col mb-1">
            <label
              htmlFor={field.field_name}
              className="mb-1 font-medium text-slate-300 tracking-wide text-xs uppercase"
            >
              {field.field_label}
              <span className="text-red-400 ml-1">*</span>
            </label>
            <select
              name="layanan_id"
              value={form.layanan_id || ""}
              onChange={handleChange}
              className="focus:ring-2 focus:ring-blue-400 bg-slate-900 text-slate-100 placeholder:text-slate-400 border border-slate-600 rounded-md px-3 py-2 h-10 shadow-sm transition-all text-base"
            >
              <option value="">Pilih Layanan</option>
              {layananOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        );
      }

      // Khusus pelaksana: pastikan selalu tampil
      if (field.field_name === "pelaksana") {
        pelaksanaRendered = true;
        return (
          <div key={field.field_name} className="flex flex-col mb-1">
            <label
              htmlFor={field.field_name}
              className="mb-1 font-medium text-slate-300 tracking-wide text-xs uppercase"
            >
              {field.field_label}
              <span className="text-red-400 ml-1">*</span>
            </label>
            <input
              type="text"
              name="pelaksana"
              value={form.pelaksana || ""}
              onChange={handleChange}
              className="focus:ring-2 focus:ring-blue-400 bg-slate-900 text-slate-100 placeholder:text-slate-400 border border-slate-600 rounded-md px-3 py-2 h-10 shadow-sm transition-all text-base"
              placeholder="Nama pelaksana"
            />
          </div>
        );
      }

      // Komponen upload file untuk field file
      const fileFields = [
        { name: "file_hasil_uji", label: "File Hasil Uji" },
        { name: "file_sertifikat", label: "File Sertifikat" },
        { name: "file_laporan_audit", label: "File Laporan Audit" },
        { name: "file_laporan_teknis", label: "File Laporan Teknis" },
      ];
      if (fileFields.some((f) => f.name === field.field_name)) {
        const fileLabel =
          fileFields.find((f) => f.name === field.field_name)?.label ||
          field.field_label;
        return (
          <div key={field.field_name} className="flex flex-col mb-1">
            <label
              htmlFor={field.field_name}
              className="mb-1 font-medium text-slate-300 tracking-wide text-xs uppercase"
            >
              {fileLabel}
              <span className="text-slate-400 ml-1 text-xs">
                (PDF/JPG/PNG, max 10MB)
              </span>
            </label>
            <input
              type="file"
              name={field.field_name}
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file && file.size > 10 * 1024 * 1024) {
                  setError("Ukuran file maksimal 10MB");
                  return;
                }
                setForm((f) => ({ ...f, [field.field_name]: file }));
              }}
              className="border rounded px-2 py-1 w-full bg-slate-900 text-slate-100 focus:ring-2 focus:ring-blue-400"
            />
          </div>
        );
      }
      // Default render
      return (
        <div key={field.field_name} className="flex flex-col mb-1">
          <label
            htmlFor={field.field_name}
            className="mb-1 font-medium text-slate-300 tracking-wide text-xs uppercase"
          >
            {field.field_label}
            {requiredFields.includes(field.field_name) && (
              <span className="text-red-400 ml-1">*</span>
            )}
          </label>
          <FormField
            field={field}
            value={form[field.field_name] || ""}
            onChange={handleChange}
            className="focus:ring-2 focus:ring-blue-400 bg-slate-900 text-slate-100 placeholder:text-slate-400 border border-slate-600 rounded-md px-3 py-2 h-10 shadow-sm transition-all text-base"
            readOnly={isEdit && autoFields.includes(field.field_name)}
          />
        </div>
      );
    });

  // Jika pelaksana belum dirender, tambahkan input pelaksana di bawah
  if (!pelaksanaRendered) {
    renderedFields.push(
      <div key="pelaksana" className="flex flex-col mb-1">
        <label
          htmlFor="pelaksana"
          className="mb-1 font-medium text-slate-300 tracking-wide text-xs uppercase"
        >
          Pelaksana
          <span className="text-red-400 ml-1">*</span>
        </label>
        <input
          type="text"
          name="pelaksana"
          value={form.pelaksana || ""}
          onChange={handleChange}
          className="focus:ring-2 focus:ring-blue-400 bg-slate-900 text-slate-100 placeholder:text-slate-400 border border-slate-600 rounded-md px-3 py-2 h-10 shadow-sm transition-all text-base"
          placeholder="Nama pelaksana"
        />
      </div>,
    );
  }

  return (
    <PageLayout>
      <h1 className="text-3xl font-bold text-center mb-10 text-blue-200 tracking-wide drop-shadow-lg">
        {isEdit ? "Edit" : "Tambah"} UPT-TKN
      </h1>
      <div className="flex justify-center items-start min-h-[70vh]">
        <div className="w-full max-w-5xl bg-slate-800/90 rounded-3xl shadow-2xl border border-slate-700 p-10 flex flex-col items-center">
          {error && (
            <div className="w-full mb-4 text-center text-red-400 font-semibold bg-red-900/30 border border-red-700 rounded-lg py-2 px-4">
              {error}
            </div>
          )}
          <form
            onSubmit={handleSubmit}
            className="w-full grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4"
            autoComplete="off"
            style={{ maxHeight: "70vh", overflowY: "auto" }}
          >
            {renderedFields}
            <div className="md:col-span-2 flex justify-center mt-6">
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold py-3 px-10 rounded-xl shadow-lg text-lg tracking-wider transition-all duration-200"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageLayout>
  );
}
