import BaseTable from '../../components/base/BaseTable';

export default function M025ListPage() {
  return (
    <BaseTable 
      endpoint="/belanja_barang"
      title="Belanja Barang"
      icon="shopping-cart"
      moduleId="m025"
    />
  );
}
