import BaseTable from '../../components/base/BaseTable';

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
