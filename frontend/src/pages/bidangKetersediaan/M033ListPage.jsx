import BaseTable from '../../components/base/BaseTable';

export default function M033ListPage() {
  return (
    <BaseTable 
      endpoint="/produksi_pangan"
      title="Data Produksi Pangan"
      icon="chart-bar"
      moduleId="m033"
    />
  );
}
