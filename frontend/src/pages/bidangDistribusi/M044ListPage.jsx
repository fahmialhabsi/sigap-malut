import BaseTable from '../../components/base/BaseTable';

export default function M044ListPage() {
  return (
    <BaseTable 
      endpoint="/inflasi_pangan"
      title="Inflasi Pangan Bulanan"
      icon="arrow-trending-up"
      moduleId="m044"
    />
  );
}
