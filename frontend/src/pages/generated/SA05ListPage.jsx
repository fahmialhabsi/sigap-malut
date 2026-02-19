import BaseTable from '../../components/base/BaseTable';

export default function SA05ListPage() {
  return (
    <BaseTable 
      endpoint="/users"
      title="User Management"
      icon="users"
      moduleId="sa05"
    />
  );
}
