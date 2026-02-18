import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function EditPage() {
  const { moduleId, id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});

  const fetchData = useCallback(async () => {
    try {
      const response = await api.get(`/${moduleId}/${id}`);
      const data = response.data.data;
      setFormData(data);
    } catch (err) {
      setError(err.response?.data?.message || "Error loading data");
    } finally {
      setLoading(false);
    }
  }, [moduleId, id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put(`/${moduleId}/${id}`, formData);
      alert("✅ Data berhasil diupdate!");
      navigate(`/module/${moduleId}`);
    } catch (err) {
      alert("❌ Error: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
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
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
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

              {renderField(field, formData[field.name], handleChange)}
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
            disabled={saving}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "💾 Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}

// Helper: Render field based on type
function renderField(field, value, onChange) {
  const baseClass =
    "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500";

  if (field.type === "select") {
    return (
      <select
        name={field.name}
        value={value || ""}
        onChange={onChange}
        className={baseClass}
        required={field.required}
      >
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
        name={field.name}
        value={value || ""}
        onChange={onChange}
        rows={3}
        className={baseClass}
        required={field.required}
      />
    );
  }

  if (field.type === "number") {
    return (
      <input
        type="number"
        name={field.name}
        value={value || ""}
        onChange={onChange}
        step={field.step || "0.01"}
        className={baseClass}
        required={field.required}
      />
    );
  }

  return (
    <input
      type={field.type || "text"}
      name={field.name}
      value={value || ""}
      onChange={onChange}
      className={baseClass}
      required={field.required}
      readOnly={field.readOnly}
    />
  );
}

// Helper: Get module name
function getModuleName(moduleId) {
  const names = {
    "sek-adm": "Administrasi Umum",
    "bds-hrg": "Harga Pangan",
    "bkt-pgd": "Produksi Pangan",
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
