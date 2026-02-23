import BaseTable from '../../components/base/BaseTable';

export default function M065ListPage() {
  return (
    <BaseTable 
      endpoint="/edukasi_konsumsi"
      title="Edukasi Konsumsi Pangan"
      icon="academic-cap"
      moduleId="m065"
    />
  );
}
