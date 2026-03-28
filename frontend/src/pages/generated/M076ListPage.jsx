import BaseTable from '../../components/base/BaseTable';

export default function M076ListPage() {
  return (
    <BaseTable 
      endpoint="/hasil_uji_mikrobiologi"
      title="Hasil Uji Mikrobiologi"
      icon="virus"
      moduleId="m076"
    />
  );
}
