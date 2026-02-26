import BaseTable from '../../components/base/BaseTable';

export default function M063ListPage() {
  return (
    <BaseTable 
      endpoint="/inspeksi_keamanan"
      title="Inspeksi Keamanan Pangan"
      icon="magnifying-glass"
      moduleId="m063"
    />
  );
}
