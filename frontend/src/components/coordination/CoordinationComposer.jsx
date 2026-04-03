import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import coordinationService from "../../services/coordinationService";
import { buildAutoReference } from "./coordinationOptions";

function initialState(
  defaultTargetRole,
  defaultKind,
  defaultReference = "",
  defaultExpectedOutput = "",
) {
  return {
    title: "",
    description: "",
    target_role: defaultTargetRole || "",
    due_date: "",
    priority: 3,
    kind: defaultKind || "koordinasi",
    agenda: "",
    expected_output: defaultExpectedOutput || "",
    reference: defaultReference || "",
  };
}

export default function CoordinationComposer({
  title,
  subtitle,
  targetOptions = [],
  kindOptions = [],
  defaultTargetRole,
  defaultKind = "koordinasi",
  /** Mengisi judul saat berubah (mis. dari Inbox Kepala Dinas / koordinasi bawahan). */
  defaultTitle = "",
  submitLabel = "Kirim",
  panelClassName = "",
  onSubmitted,
  autoReference = false,
  actorReferenceCode = "SIGAP",
  referenceLabel = "Referensi",
  expectedOutputOptions = [],
}) {
  const resolvedTargetRole =
    defaultTargetRole || targetOptions[0]?.value || "sekretaris";
  const resolvedKind = defaultKind || kindOptions[0]?.value || "koordinasi";
  const defaultExpectedOutput = expectedOutputOptions[0]?.value || "";
  const computedReference = useMemo(
    () =>
      buildAutoReference({
        kind: resolvedKind,
        targetRole: resolvedTargetRole,
        actorCode: actorReferenceCode,
      }),
    [actorReferenceCode, resolvedKind, resolvedTargetRole],
  );
  const [form, setForm] = useState(
    initialState(
      resolvedTargetRole,
      resolvedKind,
      autoReference ? computedReference : "",
      defaultExpectedOutput,
    ),
  );
  const [submitting, setSubmitting] = useState(false);

  const hasSingleTarget = targetOptions.length <= 1;
  const hasSingleKind = kindOptions.length <= 1;
  const useExpectedOutputSelect = expectedOutputOptions.length > 0;

  const heading = useMemo(() => title || "Form Koordinasi", [title]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      target_role: prev.target_role || resolvedTargetRole,
      kind: prev.kind || resolvedKind,
      expected_output:
        prev.expected_output || defaultExpectedOutput || prev.expected_output,
    }));
  }, [defaultExpectedOutput, resolvedKind, resolvedTargetRole]);

  useEffect(() => {
    if (!autoReference) return;
    setForm((prev) => ({
      ...prev,
      reference: buildAutoReference({
        kind: prev.kind || resolvedKind,
        targetRole: prev.target_role || resolvedTargetRole,
        actorCode: actorReferenceCode,
      }),
    }));
  }, [actorReferenceCode, autoReference, resolvedKind, resolvedTargetRole]);

  useEffect(() => {
    const t = String(defaultTitle || "").trim();
    if (!t) return;
    setForm((prev) => ({ ...prev, title: t }));
  }, [defaultTitle]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.target_role) {
      toast.error("Judul dan tujuan wajib diisi.");
      return;
    }

    setSubmitting(true);
    try {
      await coordinationService.create({
        ...form,
        title: form.title.trim(),
        description: form.description.trim() || null,
        agenda: form.agenda.trim() || null,
        expected_output: String(form.expected_output || "").trim() || null,
        reference: String(form.reference || "").trim() || null,
        due_date: form.due_date || null,
        priority: Number(form.priority || 3),
      });
      toast.success("Berhasil dikirim.");
      setForm(
        initialState(
          resolvedTargetRole,
          resolvedKind,
          autoReference ? computedReference : "",
          defaultExpectedOutput,
        ),
      );
      onSubmitted?.();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Gagal mengirim koordinasi.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function updateField(key, value) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (autoReference && (key === "target_role" || key === "kind")) {
        next.reference = buildAutoReference({
          kind: key === "kind" ? value : next.kind,
          targetRole: key === "target_role" ? value : next.target_role,
          actorCode: actorReferenceCode,
        });
      }
      return next;
    });
  }

  return (
    <section
      className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 ${panelClassName}`}
    >
      <div className="mb-4">
        <h2 className="font-bold text-gray-800">{heading}</h2>
        {subtitle ? (
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-gray-600">Judul</span>
            <input
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800"
              placeholder="Tuliskan Judul Koordinasi"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-gray-600">Tujuan</span>
            {hasSingleTarget ? (
              <div className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-gray-50">
                {targetOptions[0]?.label || "-"}
              </div>
            ) : (
              <select
                value={form.target_role}
                onChange={(e) => updateField("target_role", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800"
              >
                {targetOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-gray-600">Jenis</span>
            {hasSingleKind ? (
              <div className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-gray-50">
                {kindOptions[0]?.label || "Koordinasi"}
              </div>
            ) : (
              <select
                value={form.kind}
                onChange={(e) => updateField("kind", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800"
              >
                {kindOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-gray-600">Deadline</span>
            <input
              type="date"
              value={form.due_date}
              onChange={(e) => updateField("due_date", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-gray-600">Prioritas</span>
            <select
              value={form.priority}
              onChange={(e) => updateField("priority", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800"
            >
              <option value={1}>Urgent</option>
              <option value={2}>High</option>
              <option value={3}>Normal</option>
              <option value={4}>Low</option>
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-gray-600">{referenceLabel}</span>
            <input
              value={form.reference}
              onChange={(e) => updateField("reference", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800"
              placeholder="Nomor surat / agenda / referensi"
              readOnly={autoReference}
            />
          </label>

          <label className="md:col-span-2 flex flex-col gap-1">
            <span className="text-xs text-gray-600">Agenda / Fokus</span>
            <input
              value={form.agenda}
              onChange={(e) => updateField("agenda", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800"
              placeholder="Ringkasan agenda atau fokus arahan"
            />
          </label>

          <label className="md:col-span-2 flex flex-col gap-1">
            <span className="text-xs text-gray-600">
              Output yang Diharapkan
            </span>
            {useExpectedOutputSelect ? (
              <select
                value={form.expected_output}
                onChange={(e) => updateField("expected_output", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800"
              >
                {expectedOutputOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={form.expected_output}
                onChange={(e) => updateField("expected_output", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800"
                placeholder="Contoh: ringkasan tindak lanjut, data pendukung, rencana aksi"
              />
            )}
          </label>

          <label className="md:col-span-2 flex flex-col gap-1">
            <span className="text-xs text-gray-600">Deskripsi</span>
            <textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              className="w-full min-h-[120px] border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800"
              placeholder="Jelaskan konteks, detail arahan, atau kebutuhan koordinasi"
            />
          </label>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-60"
          >
            {submitting ? "Mengirim..." : submitLabel}
          </button>
        </div>
      </form>
    </section>
  );
}
