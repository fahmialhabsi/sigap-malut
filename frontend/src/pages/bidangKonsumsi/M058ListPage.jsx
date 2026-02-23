import BaseTable from '../../components/base/BaseTable';

export default function M058ListPage() {
  return (
    <BaseTable 
      endpoint="/sppg_penerima"
      title="Data SPPG Penerima"
      icon="user-group"
      moduleId="m058"
    />
  );
}
