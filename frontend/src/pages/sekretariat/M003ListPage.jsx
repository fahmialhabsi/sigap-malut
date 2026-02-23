import BaseTable from '../../components/base/BaseTable';

export default function M003ListPage() {
  return (
    <BaseTable 
      endpoint="/pangkat_tracking"
      title="Tracking Kenaikan Pangkat"
      icon="arrow-trending-up"
      moduleId="m003"
    />
  );
}
