import BaseTable from '../../components/base/BaseTable';

export default function M066ListPage() {
  return (
    <BaseTable 
      endpoint="/umkm_pangan"
      title="Data UMKM Pangan"
      icon="building-storefront"
      moduleId="m066"
    />
  );
}
