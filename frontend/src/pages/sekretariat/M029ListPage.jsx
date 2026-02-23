import BaseTable from '../../components/base/BaseTable';

export default function M029ListPage() {
  return (
    <BaseTable 
      endpoint="/rkpd"
      title="RKPD"
      icon="building-office-2"
      moduleId="m029"
    />
  );
}
