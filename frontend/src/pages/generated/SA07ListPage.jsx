import BaseTable from '../../components/base/BaseTable';

export default function SA07ListPage() {
  return (
    <BaseTable 
      endpoint="/system_config"
      title="System Configuration"
      icon="cog-6-tooth"
      moduleId="sa07"
    />
  );
}
