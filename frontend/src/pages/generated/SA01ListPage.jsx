import BaseTable from "../../components/base/BaseTable";

const columns = [
  { key: "indikator", label: "Indikator" },
  { key: "nilai", label: "Nilai" },
  { key: "target", label: "Target" },
  { key: "status", label: "Status" },
  // Tambahkan kolom lain sesuai kebutuhan
];
export default function SA01ListPage() {
  return (
    <BaseTable
      endpoint="/kpi_tracking"
      title="Dashboard KPI 50 Indikator"
      icon="chart-bar-square"
      moduleId="sa01"
    />
  );
}
