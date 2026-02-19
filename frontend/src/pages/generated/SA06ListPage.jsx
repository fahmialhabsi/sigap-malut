import BaseTable from '../../components/base/BaseTable';

export default function SA06ListPage() {
  return (
    <BaseTable 
      endpoint="/audit_log"
      title="Audit Trail"
      icon="clipboard-document-list"
      moduleId="sa06"
    />
  );
}
