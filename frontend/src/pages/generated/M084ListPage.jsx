import BaseTable from '../../components/base/BaseTable';

export default function M084ListPage() {
  return (
    <BaseTable 
      endpoint="/request_data"
      title="Request Data Peneliti"
      icon="document-magnifying-glass"
      moduleId="m084"
    />
  );
}
