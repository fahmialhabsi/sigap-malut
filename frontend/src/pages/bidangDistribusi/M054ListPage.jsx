import BaseTable from '../../components/base/BaseTable';

export default function M054ListPage() {
  return (
    <BaseTable 
      endpoint="/tpid_rapat"
      title="Rapat TPID"
      icon="users"
      moduleId="m054"
    />
  );
}
