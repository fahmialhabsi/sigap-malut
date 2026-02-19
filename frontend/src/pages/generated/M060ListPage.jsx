import BaseTable from '../../components/base/BaseTable';

export default function M060ListPage() {
  return (
    <BaseTable 
      endpoint="/program_mbg"
      title="Program Makan Bergizi Gratis"
      icon="heart"
      moduleId="m060"
    />
  );
}
