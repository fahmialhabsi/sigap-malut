import BaseTable from '../../components/base/BaseTable';

export default function M030ListPage() {
  return (
    <BaseTable 
      endpoint="/lakip"
      title="LAKIP (Laporan Akuntabilitas Kinerja)"
      icon="document-chart-bar"
      moduleId="m030"
    />
  );
}
