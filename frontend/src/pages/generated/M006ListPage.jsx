import BaseTable from '../../components/base/BaseTable';

export default function M006ListPage() {
  return (
    <BaseTable 
      endpoint="/perjalanan_dinas"
      title="Perjalanan Dinas"
      icon="map"
      moduleId="m006"
    />
  );
}
