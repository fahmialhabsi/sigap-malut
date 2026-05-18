import BaseTable from '../../components/base/BaseTable';

export default function M028ListPage() {
  return (
    <BaseTable 
      endpoint="/api/renja"
      title="Renja (Rencana Kerja)"
      icon="clipboard-document-list"
      moduleId="m028"
      columns={[
        { key: "tahun", label: "Tahun", type: "number" },
        { key: "judul", label: "Judul", type: "text" },
        { key: "status", label: "Status", type: "badge" },
        { key: "sinkronisasi_status", label: "Sinkronisasi", type: "badge" },
        { key: "epelara_renja_id", label: "ID e-Pelara", type: "text" },
      ]}
    />
  );
}
