import BaseTable from '../../components/base/BaseTable';

export default function M077ListPage() {
  return (
    <BaseTable 
      endpoint="/hasil_uji_fisik"
      title="Hasil Uji Fisik"
      icon="scale"
      moduleId="m077"
    />
  );
}
