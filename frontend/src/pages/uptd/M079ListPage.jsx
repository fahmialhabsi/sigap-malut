import BaseTable from '../../components/base/BaseTable';

export default function M079ListPage() {
  return (
    <BaseTable 
      endpoint="/sampling"
      title="Sampling Pangan"
      icon="cube"
      moduleId="m079"
    />
  );
}
