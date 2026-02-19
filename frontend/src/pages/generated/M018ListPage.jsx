import BaseTable from '../../components/base/BaseTable';

export default function M018ListPage() {
  return (
    <BaseTable 
      endpoint="/pemeliharaan_aset"
      title="Pemeliharaan Aset"
      icon="wrench-screwdriver"
      moduleId="m018"
    />
  );
}
