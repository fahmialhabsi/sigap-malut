import BaseTable from '../../components/base/BaseTable';

export default function M042ListPage() {
  return (
    <BaseTable 
      endpoint="/pasar"
      title="Data Pasar"
      icon="building-storefront"
      moduleId="m042"
    />
  );
}
