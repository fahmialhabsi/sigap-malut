import BaseTable from '../../components/base/BaseTable';

export default function M028ListPage() {
  return (
    <BaseTable 
      endpoint="/renja"
      title="Renja (Rencana Kerja)"
      icon="clipboard-document-list"
      moduleId="m028"
    />
  );
}
