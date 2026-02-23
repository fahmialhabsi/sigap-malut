import BaseTable from '../../components/base/BaseTable';

export default function M002ListPage() {
  return (
    <BaseTable 
      endpoint="/kgb_tracking"
      title="Tracking KGB"
      icon="calendar-days"
      moduleId="m002"
    />
  );
}
