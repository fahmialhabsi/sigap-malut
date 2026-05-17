import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import api from "../services/api";
import { notifySuccess, notifyError } from "../utils/notify";
import { sanitizeObject } from "../utils/sanitize";

export default function EditPage() {
  const { moduleId, id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [renjaList, setRenjaList] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: {} });

  const normalized = String(moduleId || "").toLowerCase();

  useEffect(() => {
    if (normalized !== "m029") return;
    let ok = true;
    (async () => {
      try {
        const res = await api.get("/renja", { params: { limit: 500 } });
        const data = res.data?.data || [];
        if (ok) setRenjaList(Array.isArray(data) ? data : []);
      } catch {
        if (ok) setRenjaList([]);
      }
    })();
    return () => {
      ok = false;
    };
  }, [normalized]);

  const fetchData = useCallback(async () => {
    try {
      const path = resolveResourcePath(moduleId, id);
      const response = await api.get(path);
      reset(response.data.data || {});
    } catch (err) {
      setError(err.response?.data?.message || "Error loading data");
    } finally {
      setLoading(false);
    }
  }, [moduleId, id, reset]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onSubmit = async (data) => {
    const sanitized = sanitizeObject(data);
    try {
      const path = resolveResourcePath(moduleId, id);
      await api.put(path, sanitized);
      notifySuccess("Data berhasil diupdate");
      navigate(`/module/${moduleId}`);
    } catch (err) {
      notifyError(
        err.response?.data?.message || err.message || "Gagal menyimpan data",
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-700">❌ {error}</p>
      </div>
    );
  }

  const moduleName = getModuleName(moduleId);
  const fields = getEditableFields(moduleId);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Edit {moduleName}</h2>
        <p className="text-sm text-gray-500">ID: {id}</p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-lg shadow p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields.map((field) => (
            <div
              key={field.name}
              className={field.fullWidth ? "md:col-span-2" : ""}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {field.label}
                {field.required && <span className="text-red-500"> *</span>}
              </label>

              {renderField(field, register, errors, { renjaList })}
              {errors[field.name] && (
                <p className="mt-1 text-xs text-red-600" role="alert">
                  {errors[field.name]?.message || `${field.label} wajib diisi`}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate(`/module/${moduleId}`)}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
          >
            {isSubmitting ? "Menyimpan..." : "💾 Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}

function resolveResourcePath(moduleId, recordId) {
  const m = String(moduleId || "").toLowerCase();
  if (m === "m028") return `/renja/${recordId}`;
  if (m === "m029") return `/rkpd/${recordId}`;
  return `/${moduleId}/${recordId}`;
}

// Helper: Render field based on type (react-hook-form register)
function renderField(field, register, errors, ctx = {}) {
  const { renjaList = [] } = ctx;
  const hasError = !!errors[field.name];
  const baseClass = `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
    hasError ? "border-red-400 bg-red-50" : "border-gray-300"
  }`;

  const validation = {
    ...(field.required && { required: `${field.label} wajib diisi` }),
  };

  if (field.dynamicRenja) {
    return (
      <select {...register(field.name, validation)} className={baseClass}>
        <option value="">— Pilih Renja —</option>
        {renjaList.map((r) => (
          <option key={r.id} value={r.id}>
            [{r.tahun}] {r.judul || r.program || `ID ${r.id}`}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "select") {
    return (
      <select {...register(field.name, validation)} className={baseClass}>
        {field.options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "textarea") {
    return (
      <textarea
        {...register(field.name, validation)}
        rows={3}
        className={baseClass}
      />
    );
  }

  if (field.type === "number") {
    return (
      <input
        type="number"
        step={field.step || "0.01"}
        {...register(field.name, {
          ...validation,
          valueAsNumber: true,
        })}
        className={baseClass}
      />
    );
  }

  return (
    <input
      type={field.type || "text"}
      readOnly={field.readOnly || false}
      {...register(field.name, validation)}
      className={baseClass}
    />
  );
}

// Helper: Get module name
function getModuleName(moduleId) {
  const names = {
    "sek-adm": "Administrasi Umum",
    "bds-hrg": "Harga Pangan",
    "bkt-pgd": "Produksi Pangan",
    m028: "Renja",
    m029: "RKPD",
  };
  return names[moduleId] || moduleId.toUpperCase();
}

// Helper: Define editable fields per module
function getEditableFields(moduleId) {
  const commonFields = {
    "sek-adm": [
      {
        name: "nomor_surat",
        label: "Nomor Surat",
        type: "text",
        required: true,
      },
      {
        name: "jenis_naskah",
        label: "Jenis Naskah",
        type: "select",
        required: true,
        options: [
          { value: "Surat Masuk", label: "Surat Masuk" },
          { value: "Surat Keluar", label: "Surat Keluar" },
          { value: "SK", label: "SK" },
          { value: "SE", label: "SE" },
          { value: "ST", label: "ST" },
          { value: "SU", label: "SU" },
          { value: "ND", label: "ND" },
          { value: "MEMO", label: "MEMO" },
          { value: "BA", label: "BA" },
          { value: "Nota Dinas", label: "Nota Dinas" },
          { value: "Laporan", label: "Laporan" },
          { value: "Lainnya", label: "Lainnya" },
        ],
      },
      {
        name: "tanggal_surat",
        label: "Tanggal Surat",
        type: "date",
        required: true,
      },
      {
        name: "pengirim_penerima",
        label: "Pengirim/Penerima",
        type: "text",
        required: true,
      },
      { name: "perihal", label: "Perihal", type: "text", required: true },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: [
          { value: "pending", label: "Pending" },
          { value: "proses", label: "Proses" },
          { value: "selesai", label: "Selesai" },
          { value: "arsip", label: "Arsip" },
        ],
      },
      {
        name: "keterangan",
        label: "Keterangan",
        type: "textarea",
        fullWidth: true,
      },
    ],
    "bds-hrg": [
      {
        name: "nama_komoditas",
        label: "Komoditas",
        type: "text",
        required: true,
      },
      { name: "nama_pasar", label: "Nama Pasar", type: "text", required: true },
      {
        name: "tanggal_pantau",
        label: "Tanggal Pantau",
        type: "date",
        required: true,
      },
      { name: "harga", label: "Harga (Rp)", type: "number", required: true },
      {
        name: "satuan",
        label: "Satuan",
        type: "select",
        required: true,
        options: [
          { value: "kg", label: "Kilogram (kg)" },
          { value: "liter", label: "Liter" },
          { value: "butir", label: "Butir" },
          { value: "ikat", label: "Ikat" },
        ],
      },
      {
        name: "tren_harga",
        label: "Tren Harga",
        type: "select",
        required: true,
        options: [
          { value: "Stabil", label: "Stabil" },
          { value: "Naik", label: "Naik" },
          { value: "Turun", label: "Turun" },
        ],
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: [
          { value: "draft", label: "Draft" },
          { value: "review", label: "Review" },
          { value: "final", label: "Final" },
          { value: "publish", label: "Publish" },
        ],
      },
      {
        name: "keterangan",
        label: "Keterangan",
        type: "textarea",
        fullWidth: true,
      },
    ],
    m028: [
      { name: "tahun", label: "Tahun", type: "number", required: true },
      {
        name: "perangkat_daerah",
        label: "Perangkat daerah",
        type: "text",
        required: false,
      },
      { name: "program", label: "Program", type: "text", required: true },
      { name: "kegiatan", label: "Kegiatan", type: "text", required: true },
      { name: "indikator", label: "Indikator", type: "text", required: true },
      { name: "target", label: "Target", type: "text", required: false },
      {
        name: "pagu",
        label: "Pagu",
        type: "number",
        step: "0.01",
        required: true,
      },
      {
        name: "judul",
        label: "Judul (opsional)",
        type: "text",
        required: false,
        fullWidth: true,
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: [
          { value: "draft", label: "Draft" },
          { value: "diajukan", label: "Diajukan" },
          { value: "disetujui", label: "Disetujui" },
          { value: "ditolak", label: "Ditolak" },
        ],
      },
    ],
    m029: [
      {
        name: "renja_id",
        label: "Renja induk",
        type: "select",
        required: true,
        dynamicRenja: true,
      },
      { name: "tahun", label: "Tahun", type: "number", required: true },
      {
        name: "nama_sub_kegiatan",
        label: "Sub kegiatan",
        type: "text",
        required: true,
        fullWidth: true,
      },
      {
        name: "indikator",
        label: "Indikator",
        type: "text",
        required: true,
        fullWidth: true,
      },
      { name: "target", label: "Target", type: "text", required: false },
      {
        name: "pagu",
        label: "Pagu",
        type: "number",
        step: "0.01",
        required: true,
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: [
          { value: "draft", label: "Draft" },
          { value: "diajukan", label: "Diajukan" },
          { value: "disetujui", label: "Disetujui" },
          { value: "ditolak", label: "Ditolak" },
        ],
      },
    ],
    "bkt-pgd": [
      {
        name: "nama_komoditas",
        label: "Komoditas",
        type: "text",
        required: true,
      },
      { name: "periode", label: "Periode", type: "date", required: true },
      {
        name: "luas_tanam",
        label: "Luas Tanam (Ha)",
        type: "number",
        step: "0.01",
      },
      {
        name: "luas_panen",
        label: "Luas Panen (Ha)",
        type: "number",
        step: "0.01",
      },
      {
        name: "produksi_total",
        label: "Produksi (Ton)",
        type: "number",
        step: "0.01",
      },
      {
        name: "produktivitas",
        label: "Produktivitas",
        type: "number",
        step: "0.01",
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: [
          { value: "draft", label: "Draft" },
          { value: "review", label: "Review" },
          { value: "final", label: "Final" },
          { value: "publish", label: "Publish" },
        ],
      },
      {
        name: "keterangan",
        label: "Keterangan",
        type: "textarea",
        fullWidth: true,
      },
    ],
  };

  return (
    commonFields[moduleId] || [
      { name: "status", label: "Status", type: "text" },
    ]
  );
}
