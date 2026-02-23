import BaseTable from '../../components/base/BaseTable';

export default function M080ListPage() {
  return (
    <BaseTable 
      endpoint="/umkm_tersertifikasi"
      title="Database UMKM Tersertifikasi"
      icon="building-office"
      moduleId="m080"
    />
  );
}
