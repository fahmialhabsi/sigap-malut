// ...existing code...
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import React from "react";

export default function GenericCreatePage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [moduleInfo, setModuleInfo] = useState(null);
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});

  const loadFormConfig = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const moduleResponse = await api.get(`/modules/${moduleId}`);
      const moduleData = moduleResponse.data?.data;

      if (!moduleData?.tabel_name) {
        throw new Error("Konfigurasi tabel modul tidak ditemukan");
      }

      const metaResponse = await api.get(`/${moduleData.tabel_name}/meta`);
      const columns = metaResponse.data?.data?.columns || [];

      const editableFields = columns.filter((column) => {
        const name = String(column.name || "").toLowerCase();
        if (column.primaryKey) return false;
        if (["id", "created_at", "updated_at", "deleted_at"].includes(name)) {
          return false;
        }
        return true;
      });

      setModuleInfo(moduleData);
      setFields(editableFields);
      setFormData(
        editableFields.reduce((accumulator, field) => {
          accumulator[field.name] = "";
          return accumulator;
        }, {}),
      );
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Gagal memuat form",
      );
    } finally {
      setLoading(false);
    }
  }, [moduleId]);

  useEffect(() => {
    loadFormConfig();
  }, [loadFormConfig]);

  const normalizedModuleId = useMemo(
    () => String(moduleId || "").toLowerCase(),
    [moduleId],
  );

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!moduleInfo?.tabel_name) return;

    setSaving(true);

    try {
      const payload = fields.reduce((accumulator, field) => {
        const currentValue = formData[field.name];
        if (currentValue === "") {
          if (field.allowNull) return accumulator;
          accumulator[field.name] = currentValue;
          return accumulator;
        }

        accumulator[field.name] = normalizeValueByType(
          currentValue,
          field.type,
        );
        return accumulator;
      }, {});

      await api.post(`/${moduleInfo.tabel_name}`, payload);
      alert("✅ Data berhasil ditambahkan");
      navigate(`/module/${normalizedModuleId}`);
    } catch (err) {
      alert(
        `❌ ${err.response?.data?.message || err.message || "Gagal menyimpan data"}`,
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-72">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-red-700 mb-2">
          Form gagal dimuat
        </h2>
        <p className="text-sm text-red-700 mb-4">{error}</p>
        <Link
          to={`/module/${normalizedModuleId}`}
          className="inline-block bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          Kembali ke daftar
        </Link>
      </div>
    );
  }

  if (!fields.length) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Form belum memiliki kolom input
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Modul{" "}
          <span className="font-semibold">
            {String(moduleId || "").toUpperCase()}
          </span>{" "}
          tidak memiliki kolom yang bisa diisi.
        </p>
        <Link
          to={`/module/${normalizedModuleId}`}
          className="inline-block bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          Kembali ke daftar
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-1">
        Tambah Data{" "}
        {moduleInfo?.nama_modul || String(moduleId || "").toUpperCase()}
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Tabel: <span className="font-medium">{moduleInfo?.tabel_name}</span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {toLabel(field.name)}
                {!field.allowNull && <span className="text-red-500"> *</span>}
              </label>
              {renderInputField(
                field,
                formData[field.name] ?? "",
                handleChange,
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Link
            to={`/module/${normalizedModuleId}`}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
}

function toLabel(name) {
  return String(name || "")
    .split("_")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function inputTypeFromColumnType(columnType = "") {
  const lower = String(columnType).toLowerCase();
  if (lower.includes("date") || lower.includes("timestamp")) return "date";
  if (
    lower.includes("int") ||
    lower.includes("numeric") ||
    lower.includes("decimal")
  ) {
    return "number";
  }
  if (lower.includes("text")) return "textarea";
  return "text";
}

function normalizeValueByType(value, columnType = "") {
  const lower = String(columnType).toLowerCase();
  if (lower.includes("int")) {
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? value : parsed;
  }
  if (
    lower.includes("decimal") ||
    lower.includes("numeric") ||
    lower.includes("real")
  ) {
    const parsed = Number.parseFloat(value);
    return Number.isNaN(parsed) ? value : parsed;
  }
  return value;
}

function renderInputField(field, value, onChange) {
  // Deklarasi hanya satu kali di awal
  const commonClassName =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500";
  const controlType = inputTypeFromColumnType(field.type);

  // Dropdown enum untuk Unit Kerja
  if (field.name === "unit_kerja") {
    const unitKerjaOptions = [
      "Sekretariat",
      "UPTD",
      "Bidang Ketersediaan",
      "Bidang Distribusi",
      "Bidang Konsumsi",
    ];
    return (
      <select
        value={value}
        onChange={(event) => onChange(field.name, event.target.value)}
        className={commonClassName}
        required={!field.allowNull}
      >
        <option value="">-- Pilih Unit Kerja --</option>
        {unitKerjaOptions.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }

  // Dropdown enum untuk Role
  if (field.name === "role") {
    const roleOptions = [
      "super_admin",
      "kepala_dinas",
      "sekretaris",
      "kepala_bidang",
      "kepala_uptd",
      "kasubbag",
      "kasubbag_umum",
      "kasubbag_kepegawaian",
      "kasubbag_perencanaan",
      "kasi_uptd",
      "kasubbag_tu_uptd",
      "kasi_mutu_uptd",
      "kasi_teknis_uptd",
      "fungsional",
      "fungsional_perencana",
      "fungsional_analis",
      "pelaksana",
      "guest",
    ];
    return (
      <select
        value={value}
        onChange={(event) => onChange(field.name, event.target.value)}
        className={commonClassName}
        required={!field.allowNull}
      >
        <option value="">-- Pilih Role --</option>
        {roleOptions.map((opt) => (
          <option key={opt} value={opt}>
            {opt.replace(/_/g, " ")}
          </option>
        ))}
      </select>
    );
  }
  // Hapus deklarasi ulang, sudah ada di atas

  // Patch: Dropdown enum untuk Unit Kerja
  if (field.name === "unit_kerja") {
    const unitKerjaOptions = [
      "Sekretariat",
      "UPTD",
      "Bidang Ketersediaan",
      "Bidang Distribusi",
      "Bidang Konsumsi",
    ];
    return (
      <select
        value={value}
        onChange={(event) => onChange(field.name, event.target.value)}
        className={commonClassName}
        required={!field.allowNull}
      >
        <option value="">-- Pilih Unit Kerja --</option>
        {unitKerjaOptions.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }

  if (controlType === "textarea") {
    return (
      <textarea
        value={value}
        onChange={(event) => onChange(field.name, event.target.value)}
        className={commonClassName}
        rows={4}
        required={!field.allowNull}
      />
    );
  }

  return (
    <input
      type={controlType}
      value={value}
      onChange={(event) => onChange(field.name, event.target.value)}
      className={commonClassName}
      required={!field.allowNull}
    />
  );
}
