import BaseTable from '../../components/base/BaseTable';

export default function M038ListPage() {
  return (
    <BaseTable 
      endpoint="/early_warning_ketersediaan"
      title="Early Warning Ketersediaan"
      icon="bell-alert"
      moduleId="m038"
    />
  );
}
