import BaseTable from '../../components/base/BaseTable';

export default function M029ListPage() {
  return (
    <BaseTable 
      endpoint="/api/rkpd"
      title="RKPD"
      icon="building-office-2"
      moduleId="m029"
      columns={[
        { key: "tahun", label: "Tahun", type: "number" },
        { key: "nama_sub_kegiatan", label: "Sub Kegiatan", type: "text" },
        { key: "indikator", label: "Indikator", type: "text" },
        { key: "target", label: "Target", type: "number" },
        { key: "pagu_anggaran", label: "Pagu", type: "currency" },
        { key: "status", label: "Status", type: "badge" },
      ]}
    />
  );
}
