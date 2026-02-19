import BaseTable from '../../components/base/BaseTable';

export default function M057ListPage() {
  return (
    <BaseTable 
      endpoint="/pph"
      title="Pola Pangan Harapan (PPH)"
      icon="chart-bar"
      moduleId="m057"
    />
  );
}
