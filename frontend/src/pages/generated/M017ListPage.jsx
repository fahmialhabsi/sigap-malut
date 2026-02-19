import BaseTable from '../../components/base/BaseTable';

export default function M017ListPage() {
  return (
    <BaseTable 
      endpoint="/aset_kendaraan"
      title="Data Kendaraan Dinas"
      icon="truck"
      moduleId="m017"
    />
  );
}
