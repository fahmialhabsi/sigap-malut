import BaseTable from '../../components/base/BaseTable';

export default function M016ListPage() {
  return (
    <BaseTable 
      endpoint="/aset_barang"
      title="Data Aset Barang"
      icon="cube"
      moduleId="m016"
    />
  );
}
