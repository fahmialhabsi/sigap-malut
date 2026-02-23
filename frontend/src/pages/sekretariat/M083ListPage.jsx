import BaseTable from '../../components/base/BaseTable';

export default function M083ListPage() {
  return (
    <BaseTable 
      endpoint="/dataset_publik"
      title="Dataset Publik"
      icon="folder-arrow-down"
      moduleId="m083"
    />
  );
}
