import BaseTable from '../../components/base/BaseTable';

export default function M062ListPage() {
  return (
    <BaseTable 
      endpoint="/diversifikasi"
      title="Diversifikasi Pangan"
      icon="arrows-pointing-out"
      moduleId="m062"
    />
  );
}
