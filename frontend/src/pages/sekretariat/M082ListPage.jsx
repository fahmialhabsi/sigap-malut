import BaseTable from '../../components/base/BaseTable';

export default function M082ListPage() {
  return (
    <BaseTable 
      endpoint="/portal_data"
      title="Portal Data Terbuka"
      icon="globe-alt"
      moduleId="m082"
    />
  );
}
