import BaseTable from '../../components/base/BaseTable';

export default function M027ListPage() {
  return (
    <BaseTable 
      endpoint="/api/renstra"
      title="Renstra (Rencana Strategis)"
      icon="map"
      moduleId="m027"
      columns={[
        { key: "judul", label: "Judul", type: "text" },
        { key: "periode_awal", label: "Periode Awal", type: "number" },
        { key: "periode_akhir", label: "Periode Akhir", type: "number" },
        { key: "status", label: "Status", type: "badge" },
        { key: "sinkronisasi_status", label: "Sinkronisasi", type: "badge" },
      ]}
    />
  );
}
