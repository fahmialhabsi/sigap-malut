import BaseTable from '../../components/base/BaseTable';

export default function SA08ListPage() {
  return (
    <BaseTable 
      endpoint="/backups"
      title="Backup & Restore"
      icon="cloud-arrow-down"
      moduleId="sa08"
    />
  );
}
