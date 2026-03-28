import BaseTable from '../../components/base/BaseTable';

export default function SA09ListPage() {
  return (
    <BaseTable 
      endpoint="/compliance_tracking"
      title="Dashboard Compliance"
      icon="shield-check"
      moduleId="sa09"
    />
  );
}
