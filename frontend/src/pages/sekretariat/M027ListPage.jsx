import BaseTable from '../../components/base/BaseTable';

export default function M027ListPage() {
  return (
    <BaseTable 
      endpoint="/renstra"
      title="Renstra (Rencana Strategis)"
      icon="map"
      moduleId="m027"
    />
  );
}
