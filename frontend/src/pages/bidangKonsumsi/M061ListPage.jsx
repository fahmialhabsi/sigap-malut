import BaseTable from '../../components/base/BaseTable';

export default function M061ListPage() {
  return (
    <BaseTable 
      endpoint="/program_b2sa"
      title="Program B2SA"
      icon="shield-check"
      moduleId="m061"
    />
  );
}
