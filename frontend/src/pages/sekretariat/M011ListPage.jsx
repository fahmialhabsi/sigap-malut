import BaseTable from '../../components/base/BaseTable';

export default function M011ListPage() {
  return (
    <BaseTable 
      endpoint="/surat_masuk"
      title="Surat Masuk"
      icon="inbox-arrow-down"
      moduleId="m011"
    />
  );
}
