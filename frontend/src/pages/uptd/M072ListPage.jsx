import BaseTable from '../../components/base/BaseTable';

export default function M072ListPage() {
  return (
    <BaseTable 
      endpoint="/audit_pangan"
      title="Audit Pangan"
      icon="clipboard-document-check"
      moduleId="m072"
    />
  );
}
