import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "../utils/api";
import React from "react";
import { notifySuccess, notifyError } from "../utils/notify";
import { sanitizeObject } from "../utils/sanitize";

export default function GenericCreatePage() {
  let { moduleId } = useParams();
  // Fallback ke 'sa05' jika moduleId tidak ada (khusus User Management)
  if (!moduleId || moduleId === "undefined") moduleId = "sa05";
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [moduleInfo, setModuleInfo] = useState(null);
  const [fields, setFields] = useState([]);

  const normalizedModuleId = useMemo(
    () => String(moduleId || "").toLowerCase(),
    [moduleId],
  );

  // Bangun Zod schema secara dinamis dari field hasil API
  const schema = useMemo(() => buildZodSchema(fields), [fields]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

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
        if (
          [
            "id",
            "created_at",
            "updated_at",
            "deleted_at",
            "is_deleted",
            "deleted_by",
          ].includes(name)
        ) {
          return false;
        }
        return true;
      });

      setModuleInfo(moduleData);
      setFields(editableFields);
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

  // Reset form dengan nilai default setiap kali fields berubah
  useEffect(() => {
    if (fields.length) {
      reset(
        fields.reduce((acc, f) => {
          acc[f.name] = "";
          return acc;
        }, {}),
      );
    }
  }, [fields, reset]);

  const onSubmit = async (data) => {
    if (!moduleInfo?.tabel_name) return;

    // Sanitasi semua nilai string sebelum kirim ke API
    const sanitized = sanitizeObject(data);

    // Normalisasi tipe numerik
    const payload = fields.reduce((acc, field) => {
      const val = sanitized[field.name];
      if (val === "" || val === undefined) {
        if (!field.allowNull) acc[field.name] = val;
        return acc;
      }
      acc[field.name] = normalizeValueByType(val, field.type);
      return acc;
    }, {});

    try {
      await api.post(`/${moduleInfo.tabel_name}`, payload);
      notifySuccess("Data berhasil ditambahkan");
      navigate(`/module/${normalizedModuleId}`);
    } catch (err) {
      notifyError(
        err.response?.data?.message || err.message || "Gagal menyimpan data",
      );
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
      {/* Tombol kembali ke daftar user khusus User Management */}
      {normalizedModuleId === "sa05" && (
        <div className="mb-4 flex justify-end">
          <Link
            to="/module/sa05"
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300"
          >
            Lihat Daftar User
          </Link>
        </div>
      )}
      <h2 className="text-2xl font-bold text-gray-800 mb-1">
        Tambah Data{" "}
        {moduleInfo?.nama_modul || String(moduleId || "").toUpperCase()}
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Tabel: <span className="font-medium">{moduleInfo?.tabel_name}</span>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {toLabel(field.name)}
                {!field.allowNull && <span className="text-red-500"> *</span>}
              </label>
              {renderInputField(field, register, errors)}
              {errors[field.name] && (
                <p className="mt-1 text-xs text-red-600" role="alert">
                  {errors[field.name]?.message}
                </p>
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
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan"}
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

/**
 * Bangun Zod schema secara dinamis dari daftar field yang dimuat dari API.
 */
function buildZodSchema(fields) {
  const shape = {};
  for (const field of fields) {
    const isRequired = !field.allowNull;
    const controlType = inputTypeFromColumnType(field.type);
    const label = toLabel(field.name);

    if (controlType === "number") {
      let s = z.coerce
        .number({ invalid_type_error: `${label} harus berupa angka` })
        .nonnegative({ message: `${label} tidak boleh negatif` });
      shape[field.name] = isRequired ? s : s.optional();
    } else {
      let s = z.string();
      if (isRequired) {
        s = s.min(1, { message: `${label} wajib diisi` }).max(1000, {
          message: `${label} maksimal 1000 karakter`,
        });
      } else {
        s = s.optional().or(z.literal(""));
      }
      shape[field.name] = s;
    }
  }
  return z.object(shape);
}

const UNIT_KERJA_OPTIONS = [
  "Sekretariat",
  "UPTD",
  "Bidang Ketersediaan",
  "Bidang Distribusi",
  "Bidang Konsumsi",
];

const ROLE_OPTIONS = [
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

const INPUT_CLASS =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500";

/**
 * Render input field yang terintegrasi dengan react-hook-form register.
 */
function renderInputField(field, register, errors) {
  const hasError = !!errors[field.name];
  const cls = `${INPUT_CLASS} ${hasError ? "border-red-400 bg-red-50" : ""}`;

  if (field.name === "unit_kerja") {
    return (
      <select {...register(field.name)} className={cls}>
        <option value="">-- Pilih Unit Kerja --</option>
        {UNIT_KERJA_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }

  if (field.name === "role") {
    return (
      <select {...register(field.name)} className={cls}>
        <option value="">-- Pilih Role --</option>
        {ROLE_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {opt.replace(/_/g, " ")}
          </option>
        ))}
      </select>
    );
  }

  const controlType = inputTypeFromColumnType(field.type);

  if (controlType === "textarea") {
    return <textarea {...register(field.name)} className={cls} rows={4} />;
  }

  return <input type={controlType} {...register(field.name)} className={cls} />;
}
