import BaseTable from '../../components/base/BaseTable';

export default function M073ListPage() {
  return (
    <BaseTable 
      endpoint="/registrasi_produk"
      title="Registrasi Produk"
      icon="document-plus"
      moduleId="m073"
    />
  );
}
