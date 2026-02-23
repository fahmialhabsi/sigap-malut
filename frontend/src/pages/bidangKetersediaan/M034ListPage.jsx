import BaseTable from '../../components/base/BaseTable';

export default function M034ListPage() {
  return (
    <BaseTable 
      endpoint="/stok_pangan"
      title="Stok Pangan Gudang"
      icon="archive-box"
      moduleId="m034"
    />
  );
}
