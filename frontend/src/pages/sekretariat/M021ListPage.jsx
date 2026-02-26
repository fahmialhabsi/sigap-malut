import BaseTable from '../../components/base/BaseTable';

export default function M021ListPage() {
  return (
    <BaseTable 
      endpoint="/rka"
      title="RKA (Rencana Kerja dan Anggaran)"
      icon="document-chart-bar"
      moduleId="m021"
    />
  );
}
