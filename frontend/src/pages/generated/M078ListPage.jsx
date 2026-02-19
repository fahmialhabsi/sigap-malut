import BaseTable from '../../components/base/BaseTable';

export default function M078ListPage() {
  return (
    <BaseTable 
      endpoint="/pengawasan_berisiko"
      title="Pengawasan Pangan Berisiko"
      icon="eye"
      moduleId="m078"
    />
  );
}
