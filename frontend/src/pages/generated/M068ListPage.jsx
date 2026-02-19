import BaseTable from '../../components/base/BaseTable';

export default function M068ListPage() {
  return (
    <BaseTable 
      endpoint="/sertifikasi_prima"
      title="Sertifikasi Prima"
      icon="shield-check"
      moduleId="m068"
    />
  );
}
