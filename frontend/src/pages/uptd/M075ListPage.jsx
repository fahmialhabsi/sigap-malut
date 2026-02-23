import BaseTable from '../../components/base/BaseTable';

export default function M075ListPage() {
  return (
    <BaseTable 
      endpoint="/hasil_uji_kimia"
      title="Hasil Uji Kimia"
      icon="test-tube"
      moduleId="m075"
    />
  );
}
