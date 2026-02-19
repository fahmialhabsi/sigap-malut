import BaseTable from '../../components/base/BaseTable';

export default function M014ListPage() {
  return (
    <BaseTable 
      endpoint="/agenda"
      title="Agenda Kegiatan"
      icon="calendar-days"
      moduleId="m014"
    />
  );
}
