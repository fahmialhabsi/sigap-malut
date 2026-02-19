import BaseTable from '../../components/base/BaseTable';

export default function M059ListPage() {
  return (
    <BaseTable 
      endpoint="/sppg_distribusi"
      title="SPPG Distribusi"
      icon="truck"
      moduleId="m059"
    />
  );
}
