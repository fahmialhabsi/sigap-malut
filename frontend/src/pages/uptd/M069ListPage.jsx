import BaseTable from '../../components/base/BaseTable';

export default function M069ListPage() {
  return (
    <BaseTable 
      endpoint="/sertifikasi_gmp"
      title="Sertifikasi GMP/NKV"
      icon="check-badge"
      moduleId="m069"
    />
  );
}
