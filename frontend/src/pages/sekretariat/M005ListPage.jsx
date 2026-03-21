import BaseTable from '../../components/base/BaseTable';

export default function M005ListPage() {
  return (
    <BaseTable 
      endpoint="/cuti"
      title="Data Cuti"
      icon="calendar"
      moduleId="m005"
    />
  );
}
