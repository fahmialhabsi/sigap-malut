import BaseTable from '../../components/base/BaseTable';

export default function M004ListPage() {
  return (
    <BaseTable 
      endpoint="/penghargaan_tracking"
      title="Tracking Penghargaan"
      icon="trophy"
      moduleId="m004"
    />
  );
}
