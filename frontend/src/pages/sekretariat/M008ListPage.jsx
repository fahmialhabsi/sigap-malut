import BaseTable from '../../components/base/BaseTable';

export default function M008ListPage() {
  return (
    <BaseTable 
      endpoint="/skp"
      title="SKP (Sasaran Kinerja Pegawai)"
      icon="clipboard-document-check"
      moduleId="m008"
    />
  );
}
