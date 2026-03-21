import BaseTable from '../../components/base/BaseTable';

export default function M031ListPage() {
  return (
    <BaseTable 
      endpoint="/monev"
      title="Monitoring & Evaluasi"
      icon="magnifying-glass-chart"
      moduleId="m031"
    />
  );
}
