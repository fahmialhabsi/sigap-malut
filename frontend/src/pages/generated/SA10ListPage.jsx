import BaseTable from '../../components/base/BaseTable';

export default function SA10ListPage() {
  return (
    <BaseTable 
      endpoint="/ai_config"
      title="AI Configuration"
      icon="sparkles"
      moduleId="sa10"
    />
  );
}
