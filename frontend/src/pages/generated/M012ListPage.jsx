import BaseTable from '../../components/base/BaseTable';

export default function M012ListPage() {
  return (
    <BaseTable 
      endpoint="/surat_keluar"
      title="Surat Keluar"
      icon="paper-airplane"
      moduleId="m012"
    />
  );
}
