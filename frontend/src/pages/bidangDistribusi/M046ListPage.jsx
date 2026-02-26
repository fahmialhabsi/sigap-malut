import BaseTable from '../../components/base/BaseTable';

export default function M046ListPage() {
  return (
    <BaseTable 
      endpoint="/dashboard_inflasi"
      title="Dashboard Inflasi TPID"
      icon="presentation-chart-line"
      moduleId="m046"
    />
  );
}
