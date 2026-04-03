import React, { useEffect, useState } from "react";
import api from "../../services/api";
import CoordinationComposer from "./CoordinationComposer";
import CoordinationOutboxPanel from "./CoordinationOutboxPanel";
import {
  COMMAND_EXPECTED_OUTPUT_OPTIONS,
  COMMAND_KIND_OPTIONS,
  COORDINATION_EXPECTED_OUTPUT_OPTIONS,
  COORDINATION_KIND_OPTIONS,
  SEKRETARIS_COORDINATION_TARGET_OPTIONS,
  SEKRETARIS_SUBORDINATE_TARGET_OPTIONS,
} from "./coordinationOptions";

export default function SekretarisCoordinationWorkspace() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [defaultPerintahTitle, setDefaultPerintahTitle] = useState("");

  function handleRefresh() {
    setRefreshKey((value) => value + 1);
  }

  useEffect(() => {
    let cancelled = false;
    api
      .get("/sekretaris/inbox-kadin", { params: { limit: 50 } })
      .then((res) => {
        const rows = Array.isArray(res.data?.data) ? res.data.data : [];
        const firstAssigned = rows.find(
          (r) => String(r.status || "").toLowerCase() === "assigned",
        );
        const title = String(firstAssigned?.title || "").trim();
        if (!cancelled && title) setDefaultPerintahTitle(title);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <CoordinationComposer
          title="Buat Perintah ke Bawahan"
          subtitle="Tujuan wajib bawahan formal Sekretaris: Kasubag Umum & Kepegawaian, JF Sekretariat, dan Bendahara."
          targetOptions={SEKRETARIS_SUBORDINATE_TARGET_OPTIONS}
          kindOptions={COMMAND_KIND_OPTIONS}
          defaultKind="perintah"
          defaultTitle={defaultPerintahTitle}
          submitLabel="Kirim Perintah"
          autoReference
          actorReferenceCode="SEK"
          referenceLabel="Referensi Otomatis"
          expectedOutputOptions={COMMAND_EXPECTED_OUTPUT_OPTIONS}
          onSubmitted={handleRefresh}
        />

        <CoordinationComposer
          title="Form Koordinasi Sekretaris"
          subtitle="Koordinasi lintas unit hanya untuk Kepala Bidang Ketersediaan, Distribusi, Konsumsi, dan Kepala UPTD Balai Pengawasan."
          targetOptions={SEKRETARIS_COORDINATION_TARGET_OPTIONS}
          kindOptions={COORDINATION_KIND_OPTIONS}
          defaultKind="koordinasi"
          submitLabel="Kirim Koordinasi"
          autoReference
          actorReferenceCode="SEK"
          referenceLabel="Referensi Otomatis"
          expectedOutputOptions={COORDINATION_EXPECTED_OUTPUT_OPTIONS}
          onSubmitted={handleRefresh}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <CoordinationOutboxPanel
          title="Inbox Perintah dari Sekretaris & Bawahan"
          subtitle="Pantau perintah yang Sekretaris kirim ke bawahan dan lihat tindak lanjut terakhir dari mereka."
          kind="perintah"
          emptyText="Belum ada perintah aktif dari Sekretaris ke bawahan."
          refreshKey={refreshKey}
        />
        <CoordinationOutboxPanel
          title="Outbox Koordinasi"
          subtitle="Pantau koordinasi Sekretaris ke Kepala Bidang dan Kepala UPTD."
          kind="koordinasi"
          emptyText="Belum ada koordinasi yang dikirim oleh Sekretaris."
          refreshKey={refreshKey}
        />
      </div>
    </div>
  );
}
