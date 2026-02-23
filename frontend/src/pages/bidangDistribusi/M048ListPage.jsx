import BaseTable from '../../components/base/BaseTable';

export default function M048ListPage() {
  return (
    <BaseTable 
      endpoint="/cppd"
      title="CPPD (Cadangan Pangan Pemerintah Daerah)"
      icon="archive-box-arrow-down"
      moduleId="m048"
    />
  );
}
