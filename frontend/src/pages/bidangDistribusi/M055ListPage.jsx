import BaseTable from '../../components/base/BaseTable';

export default function M055ListPage() {
  return (
    <BaseTable 
      endpoint="/analisis_pasokan"
      title="Analisis Pasokan"
      icon="chart-pie"
      moduleId="m055"
    />
  );
}
