import BaseTable from '../../components/base/BaseTable';

export default function M043ListPage() {
  return (
    <BaseTable 
      endpoint="/harga_pangan"
      title="Harga Pangan Harian"
      icon="currency-dollar"
      moduleId="m043"
    />
  );
}
