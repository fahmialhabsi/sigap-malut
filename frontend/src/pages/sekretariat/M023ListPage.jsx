import BaseTable from '../../components/base/BaseTable';

export default function M023ListPage() {
  return (
    <BaseTable 
      endpoint="/realisasi_anggaran"
      title="Realisasi Anggaran"
      icon="chart-pie"
      moduleId="m023"
    />
  );
}
