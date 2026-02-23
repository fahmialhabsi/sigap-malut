import BaseTable from '../../components/base/BaseTable';

export default function M047ListPage() {
  return (
    <BaseTable 
      endpoint="/distribusi_pangan"
      title="Distribusi Pangan"
      icon="truck"
      moduleId="m047"
    />
  );
}
