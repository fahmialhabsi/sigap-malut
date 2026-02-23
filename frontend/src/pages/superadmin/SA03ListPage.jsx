import BaseTable from '../../components/base/BaseTable';

export default function SA03ListPage() {
  return (
    <BaseTable 
      endpoint="/tata_naskah_templates"
      title="Template Tata Naskah Dinas"
      icon="document-text"
      moduleId="sa03"
    />
  );
}
