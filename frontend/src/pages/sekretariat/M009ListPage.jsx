import BaseTable from '../../components/base/BaseTable';

export default function M009ListPage() {
  return (
    <BaseTable 
      endpoint="/kepegawaian_detail"
      title="Database Kepegawaian"
      icon="folder-open"
      moduleId="m009"
    />
  );
}
