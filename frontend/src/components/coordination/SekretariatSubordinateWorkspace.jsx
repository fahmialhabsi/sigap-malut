import React, { useMemo, useState } from "react";
import CoordinationComposer from "./CoordinationComposer";
import CoordinationInboxPanel from "./CoordinationInboxPanel";
import CoordinationOutboxPanel from "./CoordinationOutboxPanel";
import {
  COORDINATION_EXPECTED_OUTPUT_OPTIONS,
  COORDINATION_KIND_OPTIONS,
  SEKRETARIS_ONLY_TARGET_OPTION,
} from "./coordinationOptions";

function actorReferenceCodeFromRole(role) {
  const normalized = String(role || "").toLowerCase();
  if (normalized.includes("kasubag") || normalized.includes("kasubbag")) {
    return "KSB";
  }
  if (normalized.includes("perencana")) return "JFP";
  if (normalized.includes("keuangan") || normalized.includes("ppk"))
    return "JFK";
  if (normalized.includes("pengeluaran")) return "BPG";
  if (normalized.includes("gaji")) return "BGJ";
  if (normalized.includes("barang")) return "BBR";
  return "SUB";
}

export default function SekretariatSubordinateWorkspace({
  actorRole,
  actorLabel = "Bawahan Sekretaris",
  sourceRole = "sekretaris",
  highlightTaskId = null,
}) {
  const [refreshKey, setRefreshKey] = useState(0);
  const actorReferenceCode = useMemo(
    () => actorReferenceCodeFromRole(actorRole),
    [actorRole],
  );

  function handleRefresh() {
    setRefreshKey((value) => value + 1);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <CoordinationInboxPanel
          title="Inbox Perintah dari Sekretaris"
          subtitle={`Tindak lanjuti arahan yang dikirim Sekretaris kepada ${actorLabel}.`}
          sourceRole={sourceRole}
          kind="perintah"
          refreshKey={refreshKey}
          allowClose={false}
          highlightTaskId={highlightTaskId}
        />
        <CoordinationComposer
          title="Koordinasi Baru / Permohonan ke Sekretaris"
          subtitle="Membuat task koordinasi baru ke Sekretaris — bukan balasan langsung pada kartu perintah di kiri. Untuk menjawab satu perintah yang sedang dibuka, gunakan kotak tanggapan di kartu tersebut."
          targetOptions={SEKRETARIS_ONLY_TARGET_OPTION}
          kindOptions={COORDINATION_KIND_OPTIONS}
          defaultKind="koordinasi"
          submitLabel="Kirim ke Sekretaris"
          autoReference
          actorReferenceCode={actorReferenceCode}
          referenceLabel="Referensi Otomatis"
          expectedOutputOptions={COORDINATION_EXPECTED_OUTPUT_OPTIONS}
          onSubmitted={handleRefresh}
        />
      </div>

      <CoordinationOutboxPanel
        title="Outbox Koordinasi ke Sekretaris"
        subtitle="Riwayat koordinasi, laporan balik, dan data dukung yang sudah Anda kirim ke Sekretaris."
        targetRole="sekretaris"
        kind="koordinasi"
        emptyText="Belum ada koordinasi yang dikirim ke Sekretaris."
        refreshKey={refreshKey}
      />
    </div>
  );
}
