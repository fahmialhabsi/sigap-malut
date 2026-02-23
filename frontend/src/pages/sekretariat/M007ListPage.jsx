import BaseTable from '../../components/base/BaseTable';

export default function M007ListPage() {
  return (
    <BaseTable 
      endpoint="/diklat"
      title="Diklat & Pelatihan"
      icon="academic-cap"
      moduleId="m007"
    />
  );
}
