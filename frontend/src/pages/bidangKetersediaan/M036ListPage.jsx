import BaseTable from '../../components/base/BaseTable';

export default function M036ListPage() {
  return (
    <BaseTable 
      endpoint="/kerawanan_pangan"
      title="Peta Kerawanan Pangan"
      icon="map-pin"
      moduleId="m036"
    />
  );
}
