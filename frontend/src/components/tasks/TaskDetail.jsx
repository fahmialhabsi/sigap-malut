// components/tasks/TaskDetail.jsx — Detail tugas + aksi berdasarkan role
import React, { useEffect, useState, useRef } from "react";
import { taskService } from "../../services/taskService";
import TaskStatusBadge from "./TaskStatusBadge";
import { notifySuccess, notifyError } from "../../utils/notify";

const PRIORITY_LABEL = { 1: "Mendesak", 2: "Tinggi", 3: "Normal", 4: "Rendah" };

export default function TaskDetail({ id, userRole, userId, onBack }) {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [assigneeRole, setAssigneeRole] = useState("");
  const [uploadFiles, setUploadFiles] = useState([]);
  const fileRef = useRef();

  const load = async () => {
    setLoading(true);
    try {
      const res = await taskService.detail(id);
      setTask(res.data.data);
    } catch (err) {
      notifyError("Gagal memuat detail tugas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) load();
  }, [id]);

  const act = async (fn, ...args) => {
    try {
      await fn(...args);
      notifySuccess("Berhasil");
      load();
      setNote("");
    } catch (err) {
      notifyError(err.response?.data?.message || "Gagal");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFiles.length) return notifyError("Pilih file terlebih dahulu");
    const fd = new FormData();
    Array.from(uploadFiles).forEach((f) => fd.append("files", f));
    try {
      await taskService.uploadFiles(id, fd);
      notifySuccess("File berhasil diunggah");
      load();
      setUploadFiles([]);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      notifyError("Gagal upload file");
    }
  };

  if (loading) return <div style={{ padding: 32 }}>Memuat...</div>;
  if (!task) return <div style={{ padding: 32 }}>Tugas tidak ditemukan</div>;

  const isAssignee = task.assignments?.some(
    (a) => String(a.assignee_user_id) === String(userId),
  );
  const isCreatorOrAdmin =
    String(task.created_by) === String(userId) ||
    ["sekretaris", "super_admin"].includes(userRole);
  const s = task.status;

  return (
    <div style={{ padding: 24, maxWidth: 800 }}>
      {onBack && (
        <button
          onClick={onBack}
          style={{
            marginBottom: 16,
            cursor: "pointer",
            background: "none",
            border: "none",
            color: "#2563eb",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          ← Kembali
        </button>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>{task.title}</h2>
          <div
            style={{ marginTop: 6, display: "flex", gap: 10, flexWrap: "wrap" }}
          >
            <TaskStatusBadge status={task.status} />
            <span style={{ fontSize: 13, color: "#6b7280" }}>
              Prioritas: {PRIORITY_LABEL[task.priority] || task.priority}
            </span>
            {task.due_date && (
              <span style={{ fontSize: 13, color: "#6b7280" }}>
                Tenggat: {new Date(task.due_date).toLocaleDateString("id-ID")}
              </span>
            )}
            {task.module && (
              <span style={{ fontSize: 13, color: "#6b7280" }}>
                Modul: {task.module}
              </span>
            )}
          </div>
        </div>
      </div>

      {task.description && (
        <p style={{ color: "#374151", marginBottom: 20 }}>{task.description}</p>
      )}

      {/* Assignees */}
      {task.assignments?.length > 0 && (
        <Section title="Penugasan">
          {task.assignments.map((a) => (
            <div key={a.id} style={{ fontSize: 13, marginBottom: 4 }}>
              {a.assignee?.nama_lengkap || a.assignee_user_id} (
              {a.assignee_role || a.assignee?.role}) —{" "}
              <strong>{a.status}</strong>
            </div>
          ))}
        </Section>
      )}

      {/* Actions */}
      <Section title="Aksi">
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 10,
          }}
        >
          {/* Assign — by creator/admin, when draft/assigned */}
          {(s === "draft" || s === "assigned") && isCreatorOrAdmin && (
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              <input
                style={iSmall}
                placeholder="User ID"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
              />
              <input
                style={iSmall}
                placeholder="Role"
                value={assigneeRole}
                onChange={(e) => setAssigneeRole(e.target.value)}
              />
              <button
                style={btn("blue")}
                onClick={() =>
                  act(taskService.assign, id, {
                    assignee_user_id: assigneeId,
                    assignee_role: assigneeRole,
                    note,
                  })
                }
              >
                Tugaskan
              </button>
            </div>
          )}
          {/* Accept / Reject assignment */}
          {s === "assigned" && isAssignee && (
            <>
              <button
                style={btn("green")}
                onClick={() => act(taskService.accept, id)}
              >
                Terima Tugas
              </button>
              <button
                style={btn("red")}
                onClick={() => act(taskService.rejectAssignment, id, note)}
              >
                Tolak Tugas
              </button>
            </>
          )}
          {/* Start */}
          {s === "accepted" && isAssignee && (
            <button
              style={btn("blue")}
              onClick={() => act(taskService.start, id)}
            >
              Mulai Kerjakan
            </button>
          )}
          {/* Submit */}
          {s === "in_progress" &&
            (isAssignee ||
              [
                "pelaksana",
                "bendahara",
                "fungsional",
                "fungsional_analis",
                "kasubbag",
                "super_admin",
              ].includes(userRole)) && (
              <button
                style={btn("blue")}
                onClick={() => act(taskService.submit, id, note)}
              >
                Submit ke Verifikator
              </button>
            )}
          {/* Verify */}
          {s === "submitted" &&
            [
              "fungsional",
              "fungsional_analis",
              "kepala_bidang",
              "kasubbag",
              "sekretaris",
              "super_admin",
            ].includes(userRole) && (
              <>
                <button
                  style={btn("green")}
                  onClick={() => act(taskService.verify, id, "approve", note)}
                >
                  Verifikasi ✓
                </button>
                <button
                  style={btn("red")}
                  onClick={() => act(taskService.verify, id, "reject", note)}
                >
                  Kembalikan ✗
                </button>
              </>
            )}
          {/* Review (Secretary) */}
          {s === "verified" &&
            ["sekretaris", "super_admin"].includes(userRole) && (
              <>
                <button
                  style={btn("green")}
                  onClick={() => act(taskService.review, id, "approve", note)}
                >
                  Setujui
                </button>
                <button
                  style={btn("orange")}
                  onClick={() => act(taskService.review, id, "forward", note)}
                >
                  Teruskan ke Kadin
                </button>
                <button
                  style={btn("red")}
                  onClick={() => act(taskService.review, id, "back", note)}
                >
                  Kembalikan
                </button>
              </>
            )}
          {/* Close */}
          {[
            "approved_by_secretary",
            "forwarded_to_kadin",
            "verified",
            "submitted",
          ].includes(s) &&
            ["sekretaris", "kepala_dinas", "super_admin"].includes(
              userRole,
            ) && (
              <button
                style={btn("gray")}
                onClick={() => act(taskService.close, id, note)}
              >
                Tutup Tugas
              </button>
            )}
          {/* Reject */}
          {[
            "draft",
            "assigned",
            "accepted",
            "in_progress",
            "submitted",
            "verified",
          ].includes(s) &&
            [
              "sekretaris",
              "kepala_bidang",
              "kepala_uptd",
              "super_admin",
            ].includes(userRole) && (
              <button
                style={btn("red")}
                onClick={() => act(taskService.reject, id, note)}
              >
                Tolak
              </button>
            )}
          {/* Escalate */}
          {[
            "draft",
            "assigned",
            "accepted",
            "in_progress",
            "submitted",
            "verified",
          ].includes(s) &&
            [
              "sekretaris",
              "kepala_bidang",
              "kepala_uptd",
              "super_admin",
            ].includes(userRole) && (
              <button
                style={btn("purple")}
                onClick={() => act(taskService.escalate, id, note)}
              >
                Eskalasiasi
              </button>
            )}
          {/* Reopen */}
          {["rejected", "escalated"].includes(s) &&
            ["sekretaris", "super_admin"].includes(userRole) && (
              <button
                style={btn("blue")}
                onClick={() => act(taskService.reopen, id)}
              >
                Buka Kembali
              </button>
            )}
        </div>
        <input
          style={{ ...iSmall, width: 320 }}
          placeholder="Catatan opsional..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </Section>

      {/* File upload */}
      <Section title="Lampiran Bukti">
        <form
          onSubmit={handleUpload}
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 10,
          }}
        >
          <input
            ref={fileRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.doc,.docx"
            onChange={(e) => setUploadFiles(e.target.files)}
          />
          <button type="submit" style={btn("blue")}>
            Upload
          </button>
        </form>
        {task.files?.length > 0 &&
          task.files.map((f) => (
            <div key={f.id} style={{ fontSize: 13, marginBottom: 4 }}>
              <a
                href={taskService.downloadFileUrl(id, f.id)}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#2563eb" }}
              >
                {f.file_name}
              </a>
              <span style={{ color: "#9ca3af", marginLeft: 8 }}>
                {(f.file_size / 1024).toFixed(1)} KB
              </span>
            </div>
          ))}
      </Section>

      {/* Approval history */}
      {task.approvals?.length > 0 && (
        <Section title="Riwayat Persetujuan">
          {task.approvals.map((a) => (
            <div
              key={a.id}
              style={{
                fontSize: 13,
                marginBottom: 6,
                padding: "6px 10px",
                background: "#f8fafc",
                borderRadius: 6,
              }}
            >
              <strong>{a.approver_role}</strong> — {a.decision} —{" "}
              {a.note && <em>{a.note}</em>} —{" "}
              {new Date(a.decided_at).toLocaleString("id-ID")}
            </div>
          ))}
        </Section>
      )}

      {/* Activity logs */}
      {task.logs?.length > 0 && (
        <Section title="Riwayat Aktivitas">
          {[...task.logs].reverse().map((l) => (
            <div
              key={l.id}
              style={{
                fontSize: 12,
                padding: "4px 0",
                borderBottom: "1px solid #f1f5f9",
                color: "#374151",
              }}
            >
              <strong>{l.action}</strong> ·{" "}
              {new Date(l.created_at).toLocaleString("id-ID")}
              {l.note && <span style={{ color: "#6b7280" }}> — {l.note}</span>}
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h4
        style={{
          margin: "0 0 10px",
          fontSize: 14,
          fontWeight: 700,
          color: "#374151",
          borderBottom: "1px solid #e5e7eb",
          paddingBottom: 6,
        }}
      >
        {title}
      </h4>
      {children}
    </div>
  );
}

const iSmall = {
  padding: "6px 10px",
  borderRadius: 6,
  border: "1px solid #d1d5db",
  fontSize: 13,
};
const btn = (color) => {
  const map = {
    blue: { bg: "#2563eb", c: "#fff" },
    green: { bg: "#16a34a", c: "#fff" },
    red: { bg: "#dc2626", c: "#fff" },
    orange: { bg: "#ea580c", c: "#fff" },
    gray: { bg: "#6b7280", c: "#fff" },
    purple: { bg: "#7c3aed", c: "#fff" },
  };
  const { bg, c } = map[color] || { bg: "#2563eb", c: "#fff" };
  return {
    padding: "6px 14px",
    background: bg,
    color: c,
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  };
};
