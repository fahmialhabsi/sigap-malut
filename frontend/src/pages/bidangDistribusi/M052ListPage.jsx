import BaseTable from '../../components/base/BaseTable';

export default function M052ListPage() {
  return (
    <BaseTable 
      endpoint="/gerakan_pangan_murah"
      title="Gerakan Pangan Murah"
      icon="hand-raised"
      moduleId="m052"
    />
  );
}
