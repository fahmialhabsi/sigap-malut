import BaseTable from '../../components/base/BaseTable';

export default function M049ListPage() {
  return (
    <BaseTable 
      endpoint="/cbp_bulog"
      title="CBP BULOG"
      icon="building-library"
      moduleId="m049"
    />
  );
}
