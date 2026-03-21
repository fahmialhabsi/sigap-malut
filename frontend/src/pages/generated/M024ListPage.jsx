import BaseTable from '../../components/base/BaseTable';

export default function M024ListPage() {
  return (
    <BaseTable 
      endpoint="/belanja_pegawai"
      title="Belanja Pegawai"
      icon="banknotes"
      moduleId="m024"
    />
  );
}
