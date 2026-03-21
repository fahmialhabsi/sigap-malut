import BaseTable from '../../components/base/BaseTable';

export default function M051ListPage() {
  return (
    <BaseTable 
      endpoint="/operasi_pasar"
      title="Operasi Pasar"
      icon="shopping-cart"
      moduleId="m051"
    />
  );
}
