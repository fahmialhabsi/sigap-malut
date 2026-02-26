import BaseTable from '../../components/base/BaseTable';

export default function M039ListPage() {
  return (
    <BaseTable 
      endpoint="/dampak_bencana"
      title="Data Bencana Dampak Pangan"
      icon="exclamation-triangle"
      moduleId="m039"
    />
  );
}
