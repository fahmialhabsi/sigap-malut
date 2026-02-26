import BaseTable from '../../components/base/BaseTable';

export default function M041ListPage() {
  return (
    <BaseTable 
      endpoint="/produktivitas"
      title="Produktivitas Pangan"
      icon="chart-bar"
      moduleId="m041"
    />
  );
}
