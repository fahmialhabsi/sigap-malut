import BaseTable from '../../components/base/BaseTable';

export default function M013ListPage() {
  return (
    <BaseTable 
      endpoint="/disposisi"
      title="Disposisi Surat"
      icon="arrow-path"
      moduleId="m013"
    />
  );
}
