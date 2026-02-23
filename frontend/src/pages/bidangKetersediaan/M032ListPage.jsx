import BaseTable from '../../components/base/BaseTable';

export default function M032ListPage() {
  return (
    <BaseTable 
      endpoint="/komoditas"
      title="Data Komoditas Pangan"
      icon="shopping-bag"
      moduleId="m032"
    />
  );
}
