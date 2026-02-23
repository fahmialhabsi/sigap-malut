import BaseTable from '../../components/base/BaseTable';

export default function M020ListPage() {
  return (
    <BaseTable 
      endpoint="/dpa"
      title="DPA (Dokumen Pelaksanaan Anggaran)"
      icon="banknotes"
      moduleId="m020"
    />
  );
}
