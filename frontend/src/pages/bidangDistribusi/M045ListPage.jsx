import BaseTable from '../../components/base/BaseTable';

export default function M045ListPage() {
  return (
    <BaseTable 
      endpoint="/inflasi_komoditas"
      title="Inflasi per Komoditas"
      icon="list-bullet"
      moduleId="m045"
    />
  );
}
