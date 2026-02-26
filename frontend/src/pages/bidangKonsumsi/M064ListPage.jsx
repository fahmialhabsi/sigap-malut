import BaseTable from '../../components/base/BaseTable';

export default function M064ListPage() {
  return (
    <BaseTable 
      endpoint="/keracunan_pangan"
      title="Data Keracunan Pangan"
      icon="exclamation-circle"
      moduleId="m064"
    />
  );
}
